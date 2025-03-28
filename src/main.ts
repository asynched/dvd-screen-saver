type RenderContext = CanvasRenderingContext2D

/**
 * Interface where all entities in the screen should implement.
 * Provides utilities like `setup`, `update` and `render`.
 */
interface Entity {
  /**
   * Initial setup for the object, where the values can be zeroed or
   * other actions can take place.
   */
  setup(): void

  /**
   * Updates the inner values of the entity, called frame by frame.
   */
  update(): void

  /**
   * Delegates the rendering of the entity to itself, providing a rendering
   * context where the entity can be drawn into.
   
   * @param context Rendering context to draw the entity into.
   */
  render(context: RenderContext): void
}

const Sizes = {
  CANVAS_WIDTH: window.innerWidth,
  CANVAS_HEIGHT: window.innerHeight,
  RECT_WIDTH: 128,
  RECT_HEIGHT: 72,

  rectCenterX() {
    return Math.floor(this.CANVAS_WIDTH / 2 - this.RECT_WIDTH / 2)
  },

  rectCenterY() {
    return Math.floor(this.CANVAS_HEIGHT / 2 - this.RECT_HEIGHT / 2)
  },
}

const Directions = {
  UP: -1,
  DOWN: 1,
  LEFT: -1,
  RIGHT: 1,
}

const colors = [
  'red',
  'green',
  'blue',
  'yellow',
  'pink',
  'magenta',
  'orange',
  'white',
]

class FlyingRectangle implements Entity {
  private colorIndex = 0
  private color = colors[this.colorIndex] as string

  private speed = 2
  private x = Sizes.rectCenterX()
  private y = Sizes.rectCenterY()

  private xDir = 1
  private yDir = 1

  setup() {}

  update(): void {
    // Check if the entity is colliding at the right
    if (this.x + Sizes.RECT_WIDTH >= Sizes.CANVAS_WIDTH) {
      this.xDir = Directions.LEFT
      this.updateColor()
    }

    // Check if the rectangle is colliding at the left
    if (this.x <= 0) {
      this.xDir = Directions.RIGHT
      this.updateColor()
    }

    // Check if the entity is colliding at the bottom
    if (this.y + Sizes.RECT_HEIGHT >= Sizes.CANVAS_HEIGHT) {
      this.yDir = Directions.UP
      this.updateColor()
    }

    // Check if the entity is colliding at the top
    if (this.y <= 0) {
      this.yDir = Directions.DOWN
      this.updateColor()
    }

    this.x += this.xDir * this.speed
    this.y += this.yDir * this.speed
  }

  private updateColor() {
    this.colorIndex += 1

    this.color = colors[this.colorIndex % colors.length] as string
  }

  render(context: RenderContext): void {
    context.beginPath()
    context.fillStyle = this.color
    context.fillRect(this.x, this.y, Sizes.RECT_WIDTH, Sizes.RECT_HEIGHT)
  }
}

/**
 * Helper function to await the next animation frame.
 * @returns A promise that resolves when the callback to `requestAnimationFrame` is called
 */
function tick(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

/**
 * Main class for the application.
 *
 * Handles the setup, updating and rendering of the entities found in the canvas.
 */
class Application {
  private readonly entities: Entity[] = []

  constructor(private readonly context: RenderContext) {}

  private setup() {
    this.entities.push(new FlyingRectangle())
  }

  private update() {
    this.entities.forEach((it) => it.update())
  }

  private render() {
    this.clear()
    this.entities.forEach((it) => it.render(this.context))
  }

  private clear() {
    this.context.clearRect(0, 0, Sizes.CANVAS_WIDTH, Sizes.CANVAS_HEIGHT)
  }

  async run() {
    this.setup()

    while (true) {
      await tick()
      this.update()
      this.render()
    }
  }

  static create(root: Element) {
    const canvas = document.createElement('canvas')

    canvas.width = Sizes.CANVAS_WIDTH
    canvas.height = Sizes.CANVAS_HEIGHT
    canvas.style = 'background: #000'

    root.appendChild(canvas)

    const renderingContext = canvas.getContext('2d')

    if (!renderingContext) {
      throw new Error('Failed to retrieve rendering context')
    }

    return new Application(renderingContext)
  }
}

const root = document.querySelector<HTMLDivElement>('div#root')

if (!root) {
  throw new Error('Root element is missing')
}

Application.create(root).run()
