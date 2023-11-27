import dynamic from 'next/dynamic'

const ConwaysLifeAudio = dynamic(
  () => import('@/components/ConwaysLifeAudio'),
  {ssr: false}
)

export default function conwaysLifeAudio() {

  return <ConwaysLifeAudio/>;
}