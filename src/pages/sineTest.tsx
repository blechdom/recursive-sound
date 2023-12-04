import dynamic from 'next/dynamic'

const SineTestGPU = dynamic(
  () => import('@/components/SineTestGPU'),
  {ssr: false}
)

export default function sineTest() {

  return <SineTestGPU/>;
}