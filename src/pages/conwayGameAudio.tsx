import dynamic from 'next/dynamic'

const ConwayGameAudio = dynamic(
  () => import('@/components/ConwayGameAudio'),
  {ssr: false}
)

export default function conwaysGameAudio() {

  return <ConwayGameAudio/>;
}