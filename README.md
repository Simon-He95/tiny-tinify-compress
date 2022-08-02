## tiny-tinify-compress
借助[tinify](https://tinypng.com/)提供的api实现一个简单的压缩工具
gif图片的实现来源于[imagemin-gifsicle](https://github.com/imagemin/imagemin-gifsicle)

## 安装
```shell
npm i -g tiny-tinify-compress
```

## 配置
```shell
# package.json 配置你自己key, 申请地址 https://tinypng.com/developers
# includes: "压缩目录下的图片" 只支持 'image/webp', 'image/jpeg', 'image/png', 'image/jpg', 'image/jfif', 'image/gif'
{
  "tinifyCompress": {
    "key": "your-key",
    "includes": [
      "./assets/**"
    ]
  }
}
```

## 使用
```shell
  compress
```
<img src="./assets/kv.jpg" />

