import { useEffect, useState } from "react"
import useDevice from "./useDevice"

const useWebGPU = (canvas: HTMLCanvasElement | null | undefined) => {

    const [context, setContext] = useState<GPUCanvasContext>()
    const [format, setFormat] = useState<GPUTextureFormat>('bgra8unorm')
    const { adapter, device, gpu } = useDevice()

    useEffect(() => {

        if (!canvas || !adapter) return

        const context = canvas.getContext('webgpu')
        if (context === null) return
        setContext(context)

        //const preferredFormat = context.getPreferredFormat(adapter) //已废弃
        setFormat(gpu.getPreferredCanvasFormat()) // bgra8unorm

    }, [canvas, adapter, gpu])

    return { canvas, context, format, adapter, device }
}

export default useWebGPU