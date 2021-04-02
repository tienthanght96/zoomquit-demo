import './styles.css'
import './styles.scss'
import gsap from 'gsap'
;(function () {
  const canvas = document.getElementById('canvas')
  let scale = 1
  let index = 0

  let context = null
  let images = []
  let totalImagesLoaded = 0
  const loadingElement = document.getElementById('loading')
  let timer = 0
  let loopImages = []
  let lastWidth = 0

  let screenWidth = window.innerWidth
  let screenHeight = window.innerHeight

  const imagesFileNames = Array.from(Array(87).keys()).reduce((acc, item) => {
    acc[`${item + 1}.jpg`] = null
    return acc
  }, {})

  const totalImages = Object.keys(imagesFileNames).length

  function animateElements() {
    if (totalImagesLoaded === totalImages) {
      gsap.to(loadingElement.querySelector('.loading-progress__value'), {
        width: Math.floor(totalImagesLoaded / totalImages) * 100 + '%',
      })
    } else {
      gsap.to(loadingElement, {
        display: 'none',
      })
    }
  }

  function createImageElement(src) {
    const img = new Image()
    img.src = src
    img.onload = function () {
      totalImagesLoaded++
      animateElements()
    }

    return img
  }

  function importAllImages() {
    Object.keys(imagesFileNames).forEach((key) => {
      imagesFileNames[key] = createImageElement(
        require(`./assets/${key}`).default
      )
    })
    images = Object.values(imagesFileNames)
  }

  function initCanvas() {
    canvas.setAttribute('width', window.innerWidth)
    canvas.setAttribute('height', window.innerHeight)
    context = canvas.getContext('2d')
  }

  function calculateCenterPos(w, h) {
    const x = screenWidth / 2 - w / 2
    const y = screenHeight / 2 - h / 2
    return {
      x,
      y,
    }
  }

  function initLoop() {
    for (let i = 0; i < images.length; i++) {
      var w = screenWidth
      var h = screenHeight

      loopImages.push({
        width: w,
        height: h,
        image: images[i],
        ratio: h / w,
      })
    }
  }

  function loopZoomImage() {
    context.clearRect(0, 0, screenWidth, screenHeight)
    timer += 10
    const currentItem = loopImages[index]
    let width = currentItem.width + timer
    let height = currentItem.height + timer * currentItem.ratio

    const nextFrameWidth = (width + timer) * 1.25

    if (lastWidth === nextFrameWidth) {
      const nextFrameWidth = (width + timer) * 1.25
      const nextItem = loopImages[index + 1 > loopImages.length ? 0 : index + 1]
      const { x: x2, y: y2 } = calculateCenterPos(nextFrameWidth, height)
      context.drawImage(nextItem.image, x2, y2, nextFrameWidth, height)
    } else {
      const { x: x1, y: y1 } = calculateCenterPos(width, height)
      context.drawImage(currentItem.image, x1, y1, width, height)
    }

    if (width > screenWidth * 1.25) {
      index += 1
      timer = 0
    }

    if (index > loopImages.length) {
      index = 0
    }

    window.requestAnimationFrame(loopZoomImage)
  }

  function startLoop() {
    initLoop()
    window.requestAnimationFrame(loopZoomImage)
  }

  function main() {
    if (context) {
      startLoop()
    }
  }

  window.onload = function () {
    importAllImages()
    initCanvas()
    main()
  }
})()
