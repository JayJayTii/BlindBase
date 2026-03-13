import '@/helpers/3D/gl-matrix-min.js'
const { mat4 } = glMatrix
import { FaceletCube, faceColours } from '@/helpers/FaceletCube/FaceletCube.js'

export function renderCube(gl, width, height, xSpin, ySpin, cube) {
    const gap = 0.03
    const vertexData = [
        //Corner 0
        -1, 3,-3,
        -3, 3,-3,
        -3, 3,-1,
        -1, 3,-3,
        -3, 3,-1,
        -1, 3,-1,
        
        //Corner 1
         1, 3,-3,
         3, 3,-3,
         3, 3,-1,
         1, 3,-3,
         3, 3,-1,
         1, 3,-1,

        //Corner 2
         3, 3, 3,
         3, 3, 1,
         1, 3, 3,
         3, 3, 1,
         1, 3, 3,
         1, 3, 1,

        //Corner 3
        -1, 3, 3,
        -3, 3, 1,
        -3, 3, 3,
        -1, 3, 3,
        -3, 3, 1,
        -1, 3, 1,

        //Corner 4
        -3, 3,-1,
        -3, 1,-3,
        -3, 3,-3,
        -3, 3,-1,
        -3, 1,-3,
        -3, 1,-1,

        //Corner 5
        -3, 3, 1,
        -3, 1, 3,
        -3, 3, 3,
        -3, 3, 1,
        -3, 1, 3,
        -3, 1, 1,

        //Corner 6
        -3,-1, 3,
        -3,-3, 1,
        -3,-3, 3,
        -3,-1, 3,
        -3,-3, 1,
        -3,-1, 1,

        //Corner 7
        -3,-1,-3,
        -3,-3,-1,
        -3,-3,-3,
        -3,-1,-3,
        -3,-3,-1,
        -3,-1,-1,
        
        //Corner 8
        -1, 3, 3,
        -3, 1, 3,
        -3, 3, 3,
        -1, 3, 3,
        -3, 1, 3,
        -1, 1, 3,

        //Corner 9
         1, 3, 3,
         3, 1, 3,
         3, 3, 3,
         1, 3, 3,
         3, 1, 3,
         1, 1, 3,

        //Corner 10
         3,-1, 3,
         1,-3, 3,
         3,-3, 3,
         3,-1, 3,
         1,-3, 3,
         1,-1, 3,

        //Corner 11
        -3,-1, 3,
        -1,-3, 3,
        -3,-3, 3,
        -3,-1, 3,
        -1,-3, 3,
        -1,-1, 3,

        //Corner 12
         3, 3, 1,
         3, 1, 3,
         3, 3, 3,
         3, 3, 1,
         3, 1, 3,
         3, 1, 1,

        //Corner 13
         3, 3,-1,
         3, 1,-3,
         3, 3,-3,
         3, 3,-1,
         3, 1,-3,
         3, 1,-1,

        //Corner 14
         3,-1,-3,
         3,-3,-1,
         3,-3,-3,
         3,-1,-3,
         3,-3,-1,
         3,-1,-1,

        //Corner 15
         3,-1, 3,
         3,-3, 1,
         3,-3, 3,
         3,-1, 3,
         3,-3, 1,
         3,-1, 1,

        //Corner 16
         1, 3,-3,
         3, 1,-3,
         3, 3,-3,
         1, 3,-3,
         3, 1,-3,
         1, 1,-3,

        //Corner 17
        -1, 3,-3,
        -3, 1,-3,
        -3, 3,-3,
        -1, 3,-3,
        -3, 1,-3,
        -1, 1,-3,

        //Corner 18
        -3,-1,-3,
        -1,-3,-3,
        -3,-3,-3,
        -3,-1,-3,
        -1,-3,-3,
        -1,-1,-3,

        //Corner 19
         3,-1,-3,
         1,-3,-3,
         3,-3,-3,
         3,-1,-3,
         1,-3,-3,
         1,-1,-3,

        //Corner 20
        -1,-3, 3,
        -3,-3, 1,
        -3,-3, 3,
        -1,-3, 3,
        -3,-3, 1,
        -1,-3, 1,

        //Corner 21
         1,-3, 3,
         3,-3, 1,
         3,-3, 3,
         1,-3, 3,
         3,-3, 1,
         1,-3, 1,

        //Corner 22
         3,-3,-1,
         1,-3,-3,
         3,-3,-3,
         3,-3,-1,
         1,-3,-3,
         1,-3,-1,

        //Corner 23
        -3,-3,-1,
        -1,-3,-3,
        -3,-3,-3,
        -3,-3,-1,
        -1,-3,-3,
        -1,-3,-1,

        //Edge 0
        -1, 3,-3,
         1, 3,-1,
         1, 3,-3,
        -1, 3,-3,
         1, 3,-1,
        -1, 3,-1,

        //Edge 1
         1, 3, 1,
         3, 3,-1,
         3, 3, 1,
         1, 3, 1,
         3, 3,-1,
         1, 3,-1,

        //Edge 2
         1, 3, 1,
        -1, 3, 3,
         1, 3, 3,
         1, 3, 1,
        -1, 3, 3,
        -1, 3, 1,

        //Edge 3
        -1, 3,-1,
        -3, 3, 1,
        -1, 3, 1,
        -1, 3,-1,
        -3, 3, 1,
        -3, 3,-1,

        //Edge 4
        -3, 3,-1,
        -3, 1, 1,
        -3, 3, 1,
        -3, 3,-1,
        -3, 1, 1,
        -3, 1,-1,

        //Edge 5
        -3, 1, 1,
        -3,-1, 3,
        -3, 1, 3,
        -3, 1, 1,
        -3,-1, 3,
        -3,-1, 1,

        //Edge 6
        -3,-1, 1,
        -3,-3,-1,
        -3,-3, 1,
        -3,-1, 1,
        -3,-3,-1,
        -3,-1,-1,

        //Edge 7
        -3,-1,-1,
        -3, 1,-3,
        -3,-1,-3,
        -3,-1,-1,
        -3, 1,-3,
        -3, 1,-1,

        //Edge 8
        -1, 3, 3,
         1, 1, 3,
        -1, 1, 3,
        -1, 3, 3,
         1, 1, 3,
         1, 3, 3,

        //Edge 9
         1, 1, 3,
         3,-1, 3,
         3, 1, 3,
         1, 1, 3,
         3,-1, 3,
         1,-1, 3,

        //Edge 10
         1,-1, 3,
        -1,-3, 3,
         1,-3, 3,
         1,-1, 3,
        -1,-3, 3,
        -1,-1, 3,

        //Edge 11
        -1,-1, 3,
        -3, 1, 3,
        -3,-1, 3,
        -1,-1, 3,
        -3, 1, 3,
        -1, 1, 3,

        //Edge 12
         3, 1, 1,
         3, 3,-1,
         3, 3, 1,
         3, 1, 1,
         3, 3,-1,
         3, 1,-1,

        //Edge 13
         3, 1,-1,
         3,-1,-3,
         3, 1,-3,
         3, 1,-1,
         3,-1,-3,
         3,-1,-1,

        //Edge 14
         3,-1,-1,
         3,-3, 1,
         3,-3,-1,
         3,-1,-1,
         3,-3, 1,
         3,-1, 1,

        //Edge 15
         3,-1, 1,
         3, 1, 3,
         3,-1, 3,
         3,-1, 1,
         3, 1, 3,
         3, 1, 1,

        //Edge 16
         1, 1,-3,
        -1, 3,-3,
         1, 3,-3,
         1, 1,-3,
        -1, 3,-3,
        -1, 1,-3,

        //Edge 17
        -1, 1,-3,
        -3,-1,-3,
        -3, 1,-3,
        -1, 1,-3,
        -3,-1,-3,
        -1,-1,-3,

        //Edge 18
        -1,-1,-3,
         1,-3,-3,
        -1,-3,-3,
        -1,-1,-3,
         1,-3,-3,
         1,-1,-3,

        //Edge 19
         1,-1,-3,
         3, 1,-3,
         3,-1,-3,
         1,-1,-3,
         3, 1,-3,
         1, 1,-3,

        //Edge 20
         1,-3, 3,
        -1,-3, 1,
        -1,-3, 3,
         1,-3, 3,
        -1,-3, 1,
         1,-3, 1,

        //Edge 21
         1,-3, 1,
         3,-3,-1,
         3,-3, 1,
         1,-3, 1,
         3,-3,-1,
         1,-3,-1,

        //Edge 22
         1,-3,-1,
        -1,-3,-3,
         1,-3,-3,
         1,-3,-1,
        -1,-3,-3,
        -1,-3,-1,

        //Edge 23
        -1,-3,-1,
        -3,-3, 1,
        -3,-3,-1,
        -1,-3,-1,
        -3,-3, 1,
        -1,-3, 1,

        //Center 0
        -1, 3,-1,
         1, 3, 1,
         1, 3,-1,
        -1, 3,-1,
         1, 3, 1,
        -1, 3, 1,

        //Center 1
        -3, 1,-1,
        -3,-1, 1,
        -3, 1, 1,
        -3, 1,-1,
        -3,-1, 1,
        -3,-1,-1,

        //Center 2
        -1, 1, 3,
         1,-1, 3,
         1, 1, 3,
        -1, 1, 3,
         1,-1, 3,
        -1,-1, 3,

        //Center 3
         3, 1, 1,
         3,-1,-1,
         3, 1,-1,
         3, 1, 1,
         3,-1,-1,
         3,-1, 1,

        //Center 4
         1, 1,-3,
        -1,-1,-3,
        -1, 1,-3,
         1, 1,-3,
        -1,-1,-3,
         1,-1,-3,


        //Center 5
         1,-3, 1,
        -1,-3,-1,
        -1,-3, 1,
         1,-3, 1,
        -1,-3,-1,
         1,-3,-1,

        //Piece gaps
        //White 1
         -1-gap, 3.02,-3.02,
         -1+gap, 3.02, 3.02,
         -1+gap, 3.02,-3.02,
         -1-gap, 3.02,-3.02,
         -1+gap, 3.02, 3.02,
         -1-gap, 3.02, 3.02,
        //White 2
         1-gap, 3.02,-3.02,
         1+gap, 3.02, 3.02,
         1+gap, 3.02,-3.02,
         1-gap, 3.02,-3.02,
         1+gap, 3.02, 3.02,
         1-gap, 3.02, 3.02,
        //White 3
          3.02, 3.02, -1 - gap,
          3.02, 3.02, -1 + gap,
         -3.02, 3.02, -1 - gap,
         -3.02, 3.02, -1 + gap,
          3.02, 3.02, -1 + gap,
         -3.02, 3.02, -1 - gap,
        //White 4
          3.02, 3.02, 1 - gap,
          3.02, 3.02, 1 + gap,
         -3.02, 3.02, 1 - gap,
         -3.02, 3.02, 1 + gap,
          3.02, 3.02, 1 + gap,
         -3.02, 3.02, 1 - gap,
         
        //Orange 1
        -3.02, 3.02, 1 + gap,
        -3.02,-3.02, 1 - gap,
        -3.02, 3.02, 1 - gap,
        -3.02, 3.02, 1 + gap,
        -3.02,-3.02, 1 - gap,
        -3.02,-3.02, 1 + gap,
        //Orange 2
        -3.02, 3.02, -1 + gap,
        -3.02,-3.02, -1 - gap,
        -3.02, 3.02, -1 - gap,
        -3.02, 3.02, -1 + gap,
        -3.02,-3.02, -1 - gap,
        -3.02,-3.02, -1 + gap,
        //Orange 3
        -3.02, 1 + gap, 3.02,
        -3.02, 1 - gap,-3.02,
        -3.02, 1 + gap,-3.02,
        -3.02, 1 + gap, 3.02,
        -3.02, 1 - gap,-3.02,
        -3.02, 1 - gap, 3.02,
        //Orange 4
        -3.02, -1 + gap, 3.02,
        -3.02, -1 - gap,-3.02,
        -3.02, -1 + gap,-3.02,
        -3.02, -1 + gap, 3.02,
        -3.02, -1 - gap,-3.02,
        -3.02, -1 - gap, 3.02,

        //Green 1
         -1 - gap,-3.02, 3.02,
         -1 + gap, 3.02, 3.02,
         -1 - gap, 3.02, 3.02,
         -1 - gap,-3.02, 3.02,
         -1 + gap, 3.02, 3.02,
         -1 + gap,-3.02, 3.02,
        //Green 2
         1 - gap,-3.02, 3.02,
         1 + gap, 3.02, 3.02,
         1 - gap, 3.02, 3.02,
         1 - gap,-3.02, 3.02,
         1 + gap, 3.02, 3.02,
         1 + gap,-3.02, 3.02,
        //Green 3
         -3.02, 1 + gap, 3.02,
         -3.02, 1 - gap, 3.02,
          3.02, 1 + gap, 3.02,
         -3.02, 1 - gap, 3.02,
          3.02, 1 + gap, 3.02,
          3.02, 1 - gap, 3.02,
        //Green 4
         -3.02, -1 + gap, 3.02,
         -3.02, -1 - gap, 3.02,
          3.02, -1 + gap, 3.02,
         -3.02, -1 - gap, 3.02,
          3.02, -1 + gap, 3.02,
          3.02, -1 - gap, 3.02,

        //Red 1
         3.02, 3.02, 1 + gap,
         3.02,-3.02, 1 - gap,
         3.02, 3.02, 1 - gap,
         3.02, 3.02, 1 + gap,
         3.02,-3.02, 1 - gap,
         3.02,-3.02, 1 + gap,
        //Red 2
         3.02, 3.02, -1 + gap,
         3.02,-3.02, -1 - gap,
         3.02, 3.02, -1 - gap,
         3.02, 3.02, -1 + gap,
         3.02,-3.02, -1 - gap,
         3.02,-3.02, -1 + gap,
        //Red 3
         3.02, 1 + gap, 3.02,
         3.02, 1 - gap,-3.02,
         3.02, 1 + gap,-3.02,
         3.02, 1 + gap, 3.02,
         3.02, 1 - gap,-3.02,
         3.02, 1 - gap, 3.02,
        //Red 4
         3.02, -1 + gap, 3.02,
         3.02, -1 - gap,-3.02,
         3.02, -1 + gap,-3.02,
         3.02, -1 + gap, 3.02,
         3.02, -1 - gap,-3.02,
         3.02, -1 - gap, 3.02,
         
        //Blue 1
         -1 - gap,-3.02, -3.02,
         -1 + gap, 3.02, -3.02,
         -1 - gap, 3.02, -3.02,
         -1 - gap,-3.02, -3.02,
         -1 + gap, 3.02, -3.02,
         -1 + gap,-3.02, -3.02,
        //Blue 2
         1 - gap,-3.02, -3.02,
         1 + gap, 3.02, -3.02,
         1 - gap, 3.02, -3.02,
         1 - gap,-3.02, -3.02,
         1 + gap, 3.02, -3.02,
         1 + gap,-3.02, -3.02,
        //Blue 3
         -3.02, 1 + gap, -3.02,
         -3.02, 1 - gap, -3.02,
          3.02, 1 + gap, -3.02,
         -3.02, 1 - gap, -3.02,
          3.02, 1 + gap, -3.02,
          3.02, 1 - gap, -3.02,
        //Blue 4
         -3.02, -1 + gap, -3.02,
         -3.02, -1 - gap, -3.02,
          3.02, -1 + gap, -3.02,
         -3.02, -1 - gap, -3.02,
          3.02, -1 + gap, -3.02,
          3.02, -1 - gap, -3.02,
          
        //Yellow 1
        -1 - gap,-3.02,-3.02,
        -1 + gap,-3.02, 3.02,
        -1 + gap,-3.02,-3.02,
        -1 - gap,-3.02,-3.02,
        -1 + gap,-3.02, 3.02,
        -1 - gap,-3.02, 3.02,
        //Yellow 2
         1 - gap,-3.02,-3.02,
         1 + gap,-3.02, 3.02,
         1 + gap,-3.02,-3.02,
         1 - gap,-3.02,-3.02,
         1 + gap,-3.02, 3.02,
         1 - gap,-3.02, 3.02,
        //Yellow 3
         3.02,-3.02, -1 - gap,
         3.02,-3.02, -1 + gap,
        -3.02,-3.02, -1 - gap,
        -3.02,-3.02, -1 + gap,
         3.02,-3.02, -1 + gap,
        -3.02,-3.02, -1 - gap,
        //Yellow 4
         3.02,-3.02, 1 - gap,
         3.02,-3.02, 1 + gap,
        -3.02,-3.02, 1 - gap,
        -3.02,-3.02, 1 + gap,
         3.02,-3.02, 1 + gap,
        -3.02,-3.02, 1 - gap,
    ]


    function hexToRGB(hex) {
        const num = parseInt(hex.replace('#',''), 16)
        return [((num >> 16) & 255)/256.0, ((num >> 8) & 255)/256.0, (num & 255)/256.0]
    }

    let colourData = []
    for(let corner = 0; corner < 24; corner++) { // 24 corner stickers
        const stickerColour = hexToRGB(cube.getCornerFaceletSticker(corner))
        for(let vertex = 0; vertex < 6; vertex++) { //6 vertices per corner sticker (quad = 2 triangles)
            colourData.push(...stickerColour)
        }
    }
    for(let edge = 0; edge < 24; edge++) { // 24 edge stickers
        const stickerColour = hexToRGB(cube.getEdgeFaceletSticker(edge))
        for(let vertex = 0; vertex < 6; vertex++) { //6 vertices per edge sticker (quad = 2 triangles)
            colourData.push(...stickerColour)
        }
    }
    for(let center = 0; center < 6; center++) { // 6 center stickers
        const stickerColour = hexToRGB(cube.getCenterFaceletSticker(center))
        for(let vertex = 0; vertex < 6; vertex++) { //6 vertices per center sticker (quad = 2 triangles)
            colourData.push(...stickerColour)
        }
    }
    while(colourData.length < vertexData.length)
        colourData.push(0,0,0)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW) //or gl.DYNAMIC_DRAW
    
    const colourBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colourData), gl.STATIC_DRAW) //or gl.DYNAMIC_DRAW
    
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertexShader, `
    precision mediump float;

    attribute vec3 position;
    attribute vec3 colour;
    varying vec3 vColour;

    uniform mat4 matrix;

    void main() {
        vColour = colour;
        gl_Position = matrix * vec4(position, 1);
    }
    `)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragmentShader, `
    precision mediump float;

    varying vec3 vColour;

    void main() {
        gl_FragColor = vec4(vColour, 1);
    }
    `)
    gl.compileShader(fragmentShader)

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    const positionLocation = gl.getAttribLocation(program, `position`)
    gl.enableVertexAttribArray(positionLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)

    const colourLocation = gl.getAttribLocation(program, `colour`)
    gl.enableVertexAttribArray(colourLocation)
    gl.bindBuffer(gl.ARRAY_BUFFER, colourBuffer)
    gl.vertexAttribPointer(colourLocation, 3, gl.FLOAT, false, 0, 0)

    gl.useProgram(program)
    gl.enable(gl.DEPTH_TEST)

    const uniformLocations = {
        matrix: gl.getUniformLocation(program, `matrix`),
    }

    const modelMatrix = mat4.create()
    //mat4.translate(modelMatrix, modelMatrix, [0,0,-2])
    //mat4.scale(modelMatrix, modelMatrix, [0.5,0.5,0.5])

    function degToRad(deg) {
        return deg * Math.PI / 180;
    }
    let viewMatrix = mat4.create()

    const projectionMatrix = mat4.create()
    //mat4.ortho(projectionMatrix, -10, 10, -10, 10, 0.01, 1000);
    mat4.perspective(projectionMatrix, 
        50 * Math.PI/180, //vfov in radians
        width / height, //aspect ratio
        1e-3, //near clip plane
        1e4 //far clip plane
    )
    
    const mvMatrix = mat4.create() //model-view
    const mvpMatrix = mat4.create() //model-view-projection

    gl.clearColor(0,0,0,0)
    function animate() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        //View matrix
        viewMatrix = mat4.create()
        mat4.rotateY(viewMatrix, viewMatrix, degToRad(ySpin));
        mat4.rotateX(viewMatrix, viewMatrix, degToRad(xSpin));
        mat4.translate(viewMatrix, viewMatrix, [0, 0, 13])
        mat4.invert(viewMatrix, viewMatrix)

        mat4.multiply(mvMatrix, viewMatrix, modelMatrix)
        mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix)

        gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix)
        gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3)
    }

    animate()
}