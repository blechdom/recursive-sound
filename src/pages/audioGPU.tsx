import dynamic from 'next/dynamic'

const AudioGPU = dynamic(
  () => import('@/components/AudioGPU'),
  {ssr: false}
)

export default function audioGPU() {

  return <AudioGPU/>;
}