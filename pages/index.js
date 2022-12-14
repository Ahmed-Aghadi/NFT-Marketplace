import { ethers } from "ethers"
import { useEffect, useState } from "react"
import axios from "axios"
import Web3Modal from "web3modal"

import { nftaddress, nftmarketaddress } from "../config"

import NFT from "../public/constants/NFT.json"
import Market from "../public/constants/NFTMarket.json"

export default function Home() {
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState("not-loaded")
    const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_URL || "https://matic-mumbai.chainstacklabs.com"
    useEffect(() => {
        console.log("110")
        loadNFTs()
    }, [])
    async function loadNFTs() {
        const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint)

        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)

        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)

        const data = await marketContract.fetchMarketItems()

        const items = await Promise.all(
            data.map(async (i) => {
                const tokenUri = await tokenContract.tokenURI(i.tokenId)
                const meta = await axios.get(tokenUri.replace("ipfs.w3s.", "ipfs.dweb."))
                const data = JSON.parse(meta.data)
                console.log("data", data)
                let price = ethers.utils.formatUnits(i.price.toString(), "ether")
                let item = {
                    price,
                    itemId: i.itemId.toNumber(),
                    seller: i.seller,
                    owner: i.owner,
                    image: data.image.replace("ipfs.w3s.", "ipfs.dweb."),
                    name: data.name,
                    description: data.description,
                }
                return item
            })
        )
        setNfts(items)
        setLoadingState("loaded")
    }
    async function buyNft(nft) {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

        const price = ethers.utils.parseUnits(nft.price.toString(), "ether")
        const transaction = await contract.createMarketSale(nftaddress, nft.itemId, {
            value: price,
        })
        await transaction.wait()
        loadNFTs()
    }
    if (loadingState === "not-loaded") {
        return (
            <div className="flex w-full flex-1 flex-col items-center  px-20">
                <div className="mt-12 w-1/2 animate-pulse flex-row items-center justify-center space-x-1 rounded-xl border p-6 ">
                    <div className="flex flex-col space-y-2">
                        <div className="h-6 w-11/12 rounded-md bg-gray-300 "></div>
                        <div className="h-6 w-10/12 rounded-md bg-gray-300 "></div>
                        <div className="h-6 w-9/12 rounded-md bg-gray-300 "></div>
                        <div className="h-6 w-9/12 rounded-md bg-gray-300 "></div>
                    </div>
                </div>
            </div>
        )
    } else if (loadingState === "loaded" && !nfts.length)
        return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>
    return (
        <div className="flex justify-center  text-center">
            <div className="px-4" style={{ maxWidth: "1600px" }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {nfts.map((nft, i) => (
                        <div
                            key={i}
                            className="border shadow rounded-xl overflow-hidden flex flex-1 flex-col justify-between"
                            style={{ maxHeight: "575px" }}
                        >
                            <div className="max-h-72 h-64 mb-1">
                                <img src={nft.image} className="max-h-72 mx-auto" />
                            </div>
                            <div className="p-4 pt-10">
                                <p style={{ height: "64px" }} className="text-2xl font-semibold">
                                    {nft.name}
                                </p>
                                <div style={{ height: "70px", overflow: "hidden" }}>
                                    <p className="text-gray-400">{nft.description}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-black">
                                <p className="text-2xl mb-4 font-bold text-white">
                                    {nft.price} Matic
                                </p>
                                <button
                                    className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                                    onClick={() => buyNft(nft)}
                                >
                                    Buy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
