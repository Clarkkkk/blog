import 'dotenv/config'
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'fs/promises'
import { slug } from 'github-slugger'
import { ofetch } from 'ofetch'
import ora from 'ora'
import { extname, join } from 'path'

const typoraFolder = './typora'
const blogFolder = './src/content/blog'

let hasException = false
async function parseMarkdownFiles() {
    try {
        // 读取typora文件夹
        const files = await readdir(typoraFolder)

        // 遍历所有的markdown文档
        const handleFile = async (file: string) => {
            const filePath = join(typoraFolder, file)
            const fileStats = await stat(filePath)

            if (!fileStats.isDirectory() && extname(file) === '.md') {
                // 获取文件名的纯ascii字符串
                const asciiName = await parseFileName(file.replace('.md', ''))
                if (!asciiName || /[^\x20-\x7F]/g.test(asciiName)) {
                    hasException = true
                    console.log('Parsed name not valid')
                    console.log({ file, asciiName })
                    return
                }

                // 替换文件名
                const newFileName = join(blogFolder, `${asciiName}.md`)
                // 移动md文件
                await rename(filePath, newFileName)

                // 读取markdown文档内容
                let content = await readFile(newFileName, 'utf-8')

                // 使用正则替换图片路径
                content = content.replace(
                    /!\[(.*)\]\(\.\/[^/]+\/(.*?)\)/g,
                    `![$1](./${asciiName}/$2)`
                )
                content =
                    `---
title: ${file.replace('.md', '')}
author: Aaron Zhou
description: ${file.replace('.md', '')}
pubDatetime: ${new Date().toISOString()}
postSlug: ${asciiName}
featured: false
draft: false
tags:
    - temp
---
` + content

                // 写入更新后的内容
                await writeFile(newFileName, content, 'utf-8')

                // 如果有同名文件夹，将文件夹名替换为asciiName
                const folderPath = join(typoraFolder, file.replace('.md', '.assets'))

                try {
                    const folderStats = await stat(folderPath)

                    if (folderStats.isDirectory()) {
                        const newFolderPath = join(blogFolder, asciiName)

                        // 创建blog文件夹下的同名文件夹（如果不存在）
                        await mkdir(newFolderPath, { recursive: true })

                        // 移动文件夹内的所有内容到blog文件夹下
                        await moveFolderContents(folderPath, newFolderPath)

                        // 删除typora文件夹下的同名文件夹
                        await rm(folderPath, { recursive: true })
                    }
                } catch {
                    //
                }
            }
        }

        const fileAmount = files.filter((item) => /\.md$/.test(item)).length
        const spinner = ora({
            text: `Importing ${fileAmount} documents from Typora`
        })

        spinner.start()
        try {
            let count = fileAmount
            for (const file of files) {
                await wait(500)
                await handleFile(file)
                if (/\.md$/.test(file)) {
                    count--
                }
                spinner.text = `Importing ${count || ''} documents from Typora`
            }
        } catch (e: any) {
            hasException = true
            spinner.fail(e)
        }

        if (!hasException) {
            spinner.succeed(`${fileAmount} Typora documents imported.`)
        } else {
            spinner.fail('Some documents are failed to import')
        }
    } catch (error) {
        console.error('Error: ', error)
    }
}

// 解析文件名的纯ascii字符串
async function parseFileName(fileName: string) {
    if (/[^\x20-\x7F]/g.test(fileName)) {
        const appID = process.env.TRANSLATE_APP_ID
        const appKey = process.env.TRANSLATE_APP_KEY
        const salt = new Date().getTime()
        const curTime = Math.round(new Date().getTime() / 1000)
        const signStr = appID + truncate(fileName) + salt + curTime + appKey
        const sign = await sha256(signStr)

        const data = await ofetch('https://openapi.youdao.com/api', {
            method: 'GET',
            params: {
                q: fileName,
                from: 'zh-CHS',
                to: 'en',
                appKey: appID,
                salt,
                sign,
                signType: 'v3',
                curtime: Math.round(new Date().getTime() / 1000)
            }
        })
        if (!data.translation || data.errorCode !== '0') {
            console.log('translation error')
            console.log(data)
            return ''
        }
        const translation = data.translation?.[0] || ''
        return slug(translation as string)
    } else {
        return fileName.replaceAll(' ', '-').toLowerCase()
    }
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms)
    })
}

async function sha256(message: string) {
    // Convert the message to an ArrayBuffer
    const encoder = new TextEncoder()
    const data = encoder.encode(message)

    // Generate the SHA-256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)

    // Convert the hash to a hexadecimal string
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')

    return hashHex
}

// auxiliary functions
function truncate(q: string) {
    const len = q.length
    if (len <= 20) return q
    return q.substring(0, 10) + len + q.substring(len - 10, len)
}

// 移动文件夹内的所有内容到目标文件夹
async function moveFolderContents(sourceFolder: string, targetFolder: string) {
    const files = await readdir(sourceFolder)

    for (const file of files) {
        const sourcePath = join(sourceFolder, file)
        const targetPath = join(targetFolder, file)
        await rename(sourcePath, targetPath)
    }
}

parseMarkdownFiles()
