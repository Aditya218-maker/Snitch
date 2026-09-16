import { createProduct, getSellerProduct } from "../service/product.api.js"
import { useDispatch } from "react-redux"
import { setSellerProducts } from "../state/product.slice.jsk"

export const useProduct = () => {

    const dispatch = useDispatch()

    async function handleCreateProduct(formData) {
        const data = await createProduct(formData)
        return data.product
    }

    async function handleGetSellerProduct() {
        const data = await getSellerProduct()
        dispatch(setSellerProducts(data.products))
        return data.products
    }

     return { handleCreateProduct, handleGetSellerProduct}
}
