import dynamic from 'next/dynamic'

const AudioTest = dynamic(
  () => import('@/components/AudioTest'),
  {ssr: false}
)

export default function gpuAudioTest() {

  return <AudioTest/>;
}