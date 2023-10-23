/**
 * 2023年10月23日 22:58:44
 * 支持解析痞客邦相册
 * 只需要复制相册第一张图片的url就行* * 
 *  */
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');
let i = 0 //计算照片数量
// 示例用法 替换为您要解析的相册地址第一张图
let url = 'https://用户id.pixnet.net/album/photo/100898948#after=100899621'
//默认延迟时间, 爬太快我怕出问题
let delay = 3000
//获取图片和下一个网页函数
async function parseImgTags(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    ++i;
    let src = $('#item-frame-img').attr('src')
    console.log(`解析到第${i}张图片`, src);
    let nextlink = $('.item-frame .photolink').attr('href')
    console.log('结果是,', nextlink)
    //解析到然后保存本地
    await saveImageToLocal(src)
    setTimeout(() => {
      parseImgTags(nextlink)
    }, delay);
    return nextlink
  } catch (e) {
    console.log('出了点问题')
    return ''
  }
}

//调用函数
parseImgTags(url)
  .then(nextlink => {
    console.log('有下一个', nextlink)
    return
  })
  .catch(error => {
    console.error('Error:', error);
  });


async function saveImageToLocal(imageUrl) {
  // 获取图片文件名
  const filename = path.basename(imageUrl);

  // 检查目录是否存在，如果不存在则创建
  const dir = path.join('.', 'image');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  // 构造本地文件路径
  const localPath = path.join(dir, filename);

  // 下载图片并保存到本地文件系统中
  const file = fs.createWriteStream(localPath);
  return new Promise((resolve, reject) => {
    https.get(imageUrl, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', error => {
      fs.unlink(localPath, () => {
        reject(error.message);
      });
    });
  });
}
