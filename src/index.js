import './styles.css'
import './styles.scss'
import gsap from 'gsap'
;(function () {
  const canvas = document.getElementById('canvas')
  let index = 0

  let context = null
  let images = []
  let totalImagesLoaded = 0
  const loadingElement = document.getElementById('loading')
  let timer = 0
  let loopImages = []

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
    let scale = 1

    for (let i = 0; i < images.length; i++) {
      var w = screenWidth
      var h = screenHeight
      var ratio = h / w

      loopImages.push({
        width: w,
        height: h,
        image: images[i],
        ratio,
        scale,
      })

      const width = w * scale
      const height = h * scale
      const { x, y } = calculateCenterPos(width, height)
      context.drawImage(images[i], x, y, width, height)
      scale *= 0.5
    }
  }

  function loopZoomImage() {
    context.clearRect(0, 0, screenWidth, screenHeight)
    for (let i = index; i < index + 4; i++) {
      const element = loopImages[i]
      const width = element.width * element.scale + timer * element.scale
      const height =
        element.height * element.scale + timer * element.ratio * element.scale
      const { x, y } = calculateCenterPos(width, height)
      context.drawImage(element.image, x, y, width, height)

      if (width > screenWidth * 2) {
        index += 1
      }
      if (index > loopImages.length) {
        index = 0
      }
      timer += 5
      timer += timer * 0.003
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
