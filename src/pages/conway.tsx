import dynamic from 'next/dynamic'

const ConwaysLife = dynamic(
  () => import('@/components/ConwaysLife'),
  {ssr: false}
)

export default function conwaysLife() {

  return <ConwaysLife/>;
}