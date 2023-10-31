
/**
 * 2023年10月24日 23:24:18
 * 支持解析痞客邦相册
 * 只需要复制相册第一张图片的url就行* * 
 *  */
// let pixnetAlbumNameUrl = 'https://abbey1117.pixnet.net/album/set/14245552'//北韩
// let pixnetAlbumNameUrl = 'https://abbey1117.pixnet.net/album/set/1882082'//你好
// let pixnetAlbumNameUrl = 'https://abbey1117.pixnet.net/album/list'//多相册
// let pixnetAlbumNameUrl = 'https://ohiyuo.pixnet.net/album/list'
// let pixnetAlbumNameUrl = 'https://rm8532.pixnet.net/album/list'
let pixnetAlbumNameUrl = ''

let picNum = 0
const startTime = new Date();
console.time("myTimer"); // 开始计时
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const https = require('https');
const url = require('url');
const path = require('path')
let i = 0 //计算照片数量
// 示例用法 替换为您要解析的相册地址第一张图
//取出url前半部分用来拼接下一页的url
// let baseUrl = url.parse(pixnetAlbumNameUrl).protocol + '//' + url.parse(pixnetAlbumNameUrl).host
let baseUrl = ''
//下一个后半部分url
let nextPageLink = ''

//获取图片和下一个网页函数
console.log('解析中');
//先注释这个
// getList(pixnetAlbumNameUrl) 
let AlbumList = []
let response
let html
let $
let photoLinks
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
function inputUUrl() {
  rl.question('请输入相册链接或者相册列表链接：', (answer) => {
    if (answer.includes('pixnet.net/album/set') || answer.includes('pixnet.net/album/list')) {
      pixnetAlbumNameUrl = answer
      rl.close();
      (async () => {
        baseUrl = url.parse(pixnetAlbumNameUrl).protocol + '//' + url.parse(pixnetAlbumNameUrl).host
        console.time("解析所有照片时间"); // 开始计时
        response = await axios.get(pixnetAlbumNameUrl);
        html = response.data;
        $ = cheerio.load(html);//取html页面 
        if (pixnetAlbumNameUrl.includes("album/list")) {
          console.log('解析到是多相册');
          photoLinks = $('.album-grid-list .photolink');
          photoLinks.each(async (index, element) => {
            // 先解析相册第一张
            AlbumList.push(element.attribs.href)
            // console.log('解析到相册', element.attribs.href);  
          });
        } else {
          console.log('解析到是单相册');
          AlbumList.push(pixnetAlbumNameUrl)
        }
        // console.log(AlbumList);

        //   let chunks = []
        //   let chunksPromise = []
        //   let limit = 3//
        //   // 已经被分割为一个小小的数组了
        //   for (let i = 0; i < AlbumList.length; i += limit) {
        //     chunks.push(AlbumList.slice(i, i + limit))
        //   }
        // // console.log(chunks);
        //   //重复并发相册
        //   for (let i = 0; i < chunks.length; i++) {
        //     chunksPromise.push(new Promise(async (resolve, reject) => {
        //       //这里存的是每个chunk中的每一个url,有1000个就是存入1000个promise
        //       let chunkPromise = []
        //       console.log(`正在解析第${i}个chuck`);
        //       for (let j = 0; j < chunks[i].length; j++) {
        //         chunkPromise.push(getAllPicUrl(chunks[i][j]))
        //         // console.log(chunks[i][j]);
        //       }
        //       // console.log(chunkPromise);
        //       await Promise.allSettled(chunkPromise).then(() => {
        //         console.log(chunkPromise, '解析完了第', i + 1, '个chunk');
        //         resolve('解析完一个promise')
        //       })
        //     }))
        //   }
        //   // console.log('妈的',chunksPromise,chunks.length);

        //    Promise.all(chunksPromise).then(res=>{
        //     console.log('所有都解析完-----------------------------------------------的点点滴滴----------------------');
        //   })
        //   // console.log('所有都解析完');
        //   return
        Promise.all(AlbumList.map((promise) => getAllPicUrl(promise))).then(res => {
          let totalListCount = picNum
          const endTimeCollect = new Date();
          const timeTakenCollect = endTimeCollect - startTime;
          //上面是解析完, 下面是全部写入完
          Promise.all(allPromise).then(res => {
            const endTimeWrite = new Date();
            const timeTakenWrite = endTimeWrite - startTime;
            console.log('总共写入:', i, '张');
            console.log("解析相册照片总数:", totalListCount, '张', '\n解析相册照片耗时:', timeTakenCollect, '毫秒', '\n写入操作耗时:', timeTakenWrite, '毫秒');
            // console.log(`解析所有照片耗时：${timeTakenCollect} 毫秒,操作完需要${timeTakenWrite} 毫秒,`);
          })

        })
      })()
    } else {
      console.log('URL 包含 "pixnet.net/album/set" 或 "pixnet.net/album/list"');
      inputUUrl()
    }


  });

}


let allPromise = []
async function getAllPicUrl(url) {


  let nextPageLink = url;
  let response = await axios.get(url);
  let html = response.data;
  let $ = cheerio.load(html);
  let albumName = $('meta[name="description"]').attr('content');
  albumName = filterPathName(albumName)
  // console.log('一个相册对象一次');
  const dir = path.join(process.cwd(), albumName);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log(`创建文件夹:${dir}成功`);
  }

  while (nextPageLink) {
    response = await axios.get(nextPageLink);
    html = response.data;
    $ = cheerio.load(html);
    let albumName = $('meta[name="description"]').attr('content');
    albumName = filterPathName(albumName)
    let imgList = [];
    $('.photolink .thumb').each(function (i, el) {

      if (el.attribs.src.includes("_s")) {
        let singlePic = { picName: el.attribs.alt, picSrc: el.attribs.src.replace("_s", "") }
        imgList.push(singlePic);
      } else {
        let singlePic = { picName: el.attribs.alt, picSrc: el.attribs.src }
        imgList.push(singlePic);
      }
    });
    // console.log('妈的,,,,,,,,,,,,',imgList);
    // let newObj = { name: albumName, list: imgList.singlePic };
    // allPic.push(newObj);
    picNum += imgList.length
    // console.log('加进去了', newObj);
    allPromise.push(saveImagesToLocal(imgList, albumName));
    // 注释
    nextPageUrl = $('.nextBtn').first().attr('href');
    if (nextPageUrl) {
      nextPageLink = baseUrl + nextPageUrl;
    } else {
      nextPageLink = null;
    }
  }
}

function filterPathName(albumName) {
  const specialCharsRegex = /[<>:"\/\\|?*\x00-\x1F]/g;
  return albumName.replace(specialCharsRegex, '');
}

async function saveImagesToLocal(imageUrls, albumName) {
  try {
    if (!albumName) {
      albumName = 'PixnetImage';
    }

    const requests = imageUrls.map(async (imageUrl, index) => {
      let filename = '';//一定要写在里面
      // if (imageUrl.picName) {
      // let houzhui = path.basename(imageUrl.picSrc).split(".")[path.basename(imageUrl.picSrc).split(".").length - 1]
      //  let name =  filterPathName(imageUrl.picName).trim()
      //  filename =name + '.' + houzhui
      // filename = filterPathName(imageUrl.picName + '.' + houzhui)
      // filename = path.basename(imageUrl.picSrc);

      // } else {
      filename = path.basename(imageUrl.picSrc);
      // }

      const localPath = path.join(albumName, filename);
      const file = fs.createWriteStream(localPath);


      await new Promise((resolve, reject) => {
        https.get(imageUrl.picSrc, response => {

          response.pipe(file);
          file.on('finish', () => {
            console.log(`写入第${++i}张--${albumName}--${filename}`);
            file.close(resolve);
          });
        }).on('error', error => {
          fs.unlink(localPath, () => {
            reject(error.message);
          });
        });
      });
    });

    await Promise.all(requests);

    console.log('一页图片保存成功。');
  } catch (error) {
    console.error('保存图片时发生错误：', error);
  }
}
inputUUrl()



