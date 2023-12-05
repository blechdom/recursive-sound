import dynamic from 'next/dynamic'

const ThreeOhThreeStreaming = dynamic(
  () => import('@/components/ThreeOhThreeStreaming'),
  {ssr: false}
)

export default function threeOhThreeStreaming() {

  return <ThreeOhThreeStreaming/>;
}