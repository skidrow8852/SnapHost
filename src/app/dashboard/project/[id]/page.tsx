import { type Metadata } from 'next';

type Props = {
  params: { id: string }; 
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params; 
  return {
    title: `SnapHost - Project - ${id}`,
  };
}


export default function Page({ params }: Props) {
  const { id } = params; 

  return (
    <div>
      <h1>Page ID: {id}</h1>
    </div>
  );
}