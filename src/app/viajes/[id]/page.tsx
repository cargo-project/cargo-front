import { TripDetailPage } from "@/components/trips/TripDetailPage";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <TripDetailPage id={id}/>}
