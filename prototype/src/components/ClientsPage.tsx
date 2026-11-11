import { ClientList } from "@/components/ClientList"
import { EmptyBrand } from "@/components/EmptyBrand"
import { usePrototype } from "@/hooks/use-prototype"

export function ClientsPage() {
  const { upload } = usePrototype()
  return upload ? <ClientList upload={upload} /> : <EmptyBrand />
}
