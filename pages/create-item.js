import { useState } from "react"
import { ethers } from "ethers"
import { useRouter } from "next/router"
import Web3Modal from "web3modal"

import { nftaddress, nftmarketaddress } from "../config"

import NFT from "../public/constants/NFT.json"
import Market from "../public/constants/NFTMarket.json"

export default function CreateItem() {
    const [file, setFile] = useState(null)
    const [formInput, updateFormInput] = useState({ price: "", name: "", description: "" })
    const router = useRouter()

    async function onChange(e) {
        const file = e.target.files[0]
        setFile(file)
    }
    async function createMarket() {
        const { name, description, price } = formInput
        if (!name || !description || !price || !file) return
        try {
            const body = new FormData()
            body.append("file", file)
            const resForImageCid = await fetch(
                process.env.NEXT_PUBLIC_API_URL + "/api/uploadImage",
                {
                    method: "POST",
                    body: body,
                }
            )
            const jsonOfResForImageCid = await resForImageCid.json()
            const imageCid = jsonOfResForImageCid.cid

            const data = JSON.stringify({
                name,
                description,
                image: `https://${imageCid}.ipfs.w3s.link/image`,
            })
            console.log("data", data)
            const resForJsonCid = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/uploadJson", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            })

            const jsonOfResForJsonCid = await resForJsonCid.json()

            const jsonCid = jsonOfResForJsonCid.cid
            const url = `https://${jsonCid}.ipfs.w3s.link/data.json`
            console.log("url = " + url)
            createSale(url)
        } catch (error) {
            console.log("Error uploading file: ", error)
        }
    }

    async function createSale(url) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        console.log("signer :")
        console.log(signer)

        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
        console.log("Creating token...")
        let transaction = await contract.createToken(url)
        let tx = await transaction.wait(1)
        console.log("Token created.")
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()
        console.log("parsing price")
        const price = ethers.utils.parseUnits(formInput.price)

        console.log("Get contract - nftmarket")
        contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        console.log("Creating Market Item...")
        transaction = await contract.createMarketItem(nftaddress, tokenId, price, {
            value: listingPrice,
        })
        await transaction.wait(1)
        console.log("Market Item created.")
        router.push("/")
    }

    return (
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
                <input
                    placeholder="Asset Name"
                    className="mt-8 border rounded p-4"
                    onChange={(e) => updateFormInput({ ...formInput, name: e.target.value })}
                />
                <textarea
                    placeholder="Asset Description"
                    className="mt-2 border rounded p-4"
                    onChange={(e) => updateFormInput({ ...formInput, description: e.target.value })}
                />
                <input
                    placeholder="Asset Price in Matic"
                    className="mt-2 border rounded p-4"
                    onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
                />
                <input type="file" name="Asset" className="my-4" onChange={onChange} />
                {/* {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />} */}
                <button
                    onClick={createMarket}
                    className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
                >
                    Create Digital Asset
                </button>
            </div>
        </div>
    )
}
