'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

// 由于occt-import-js是CommonJS模块，我们需要在这里直接导入
let occtModule: any = null
let occtInstance: any = null

if (typeof window !== 'undefined') {
  // 仅在客户端环境下导入
  occtModule = require('occt-import-js')
}

interface Dimensions {
  width: number
  height: number
  depth: number
}

export default function OCCTPage() {
  const [modelData, setModelData] = useState<any>(null)
  const [dimensions, setDimensions] = useState<Dimensions | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      file: undefined,
    },
  })

  const calculateDimensions = (positions: number[]) => {
    let minX = Infinity, minY = Infinity, minZ = Infinity
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity

    // 遍历所有顶点坐标
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      minZ = Math.min(minZ, z)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
      maxZ = Math.max(maxZ, z)
    }

    // 计算尺寸（毫米）
    return {
      width: Number((maxX - minX).toFixed(2)),
      height: Number((maxY - minY).toFixed(2)),
      depth: Number((maxZ - minZ).toFixed(2))
    }
  }

  useEffect(() => {
    // 初始化OCCT
    const initOCCT = async () => {
      try {
        if (!occtModule) {
          throw new Error('Failed to load OCCT module')
        }

        // 初始化实例
        occtInstance = await occtModule({
          // 指定WASM文件的位置
          locateFile: (path: string) => {
            if (path.endsWith('.wasm')) {
              return '/node_modules/occt-import-js/dist/occt-import-js.wasm'
            }
            return path
          }
        })
        console.log('OCCT initialized successfully')
      } catch (err) {
        console.error('Failed to initialize OCCT:', err)
        setError('Failed to initialize OCCT viewer')
      }
    }

    initOCCT()
  }, [])

  const onSubmit = async (data: any) => {
    const file = data.file[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setDimensions(null)
    
    try {
      if (!occtInstance) {
        throw new Error('OCCT is not initialized')
      }

      const arrayBuffer = await file.arrayBuffer()
      const fileBuffer = new Uint8Array(arrayBuffer)

      const result = await occtInstance.ReadStepFile(fileBuffer, {
        linearDeflection: 0.1,
        angularDeflection: 0.5,
      })

      if (result.success) {
        setModelData(result)
        console.log('Parsed model data:', result)

        // 计算模型尺寸
        if (result.meshes && result.meshes.length > 0) {
          const positions = result.meshes[0].attributes.position.array
          const dims = calculateDimensions(positions)
          setDimensions(dims)
        }
      } else {
        throw new Error('Failed to parse STP file')
      }
    } catch (error: any) {
      console.error('Error processing file:', error)
      setError(error.message || 'Error processing file')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">OCCT Viewer</h1>
      
      <div className="grid gap-4">
        <Card className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload STP File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".stp,.step"
                        onChange={(e) => {
                          field.onChange(e.target.files)
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Processing...' : 'Upload and View'}
              </Button>
            </form>
          </Form>
        </Card>

        {dimensions && (
          <Card className="p-4">
            <h2 className="text-xl font-semibold mb-2">Model Dimensions</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="font-medium">Width:</span> {dimensions.width}mm
              </div>
              <div>
                <span className="font-medium">Height:</span> {dimensions.height}mm
              </div>
              <div>
                <span className="font-medium">Depth:</span> {dimensions.depth}mm
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4">
          <div className="w-full h-[400px] bg-slate-100 rounded-lg flex items-center justify-center">
            {loading ? (
              <div>Processing file...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : modelData ? (
              <pre className="text-sm overflow-auto max-h-full p-4">
                {JSON.stringify(modelData, null, 2)}
              </pre>
            ) : (
              <div className="text-gray-500">Upload a file to view</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}