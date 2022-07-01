import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  ItemBought as ItemBoughtEvent,
  ItemCanceled as ItemCanceledEvent,
  ItemListed as ItemListedEvent
} from "../generated/NftMarketplace/NftMarketplace"

import { ItemListed, ActiveItem, ItemBought, ItemCanceled } from "../generated/schema";

//Activeitem listed: 
//Si tiene el addres de la muerte, significa que ha sido cancelado
//Si tiene un addres vacio, significa que ha sido listado
//si tiene address real, significa que alguien lo ha comprado

export function handleItemBought(event: ItemBoughtEvent): void { //cuando se ejecute el evento ItemBought  hacer lo que handleItemBought indique
  //Save that even in our graph
  // update our activeitems

  //get or create on itemlisted object
  //each item neeeds a unique Id

  //ItemBoughtEvent: Just the raw event
  //ItemBoughtObject: What we save(estos objetos se generan automaticamenet en ./generated/schema.ts)
  let itemBought = ItemBought.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  //aunque tengan el mismo id, da igual porque estos objetos son de distinto tipo 
  let activeItem = ActiveItem.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  if(!itemBought){
    itemBought = new ItemBought(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    )
    itemBought.buyer = event.params.buyer
    itemBought.nftAddress = event.params.nftAddress
    itemBought.tokenId = event.params.tokenId
    activeItem!.buyer = event.params.buyer //activeItem!. significa que despues crearemos el objeto activeItem

    itemBought.save()
    activeItem!.save()
  }
}

export function handleItemCanceled(event: ItemCanceledEvent): void {
  let itemCanceled = ItemCanceled.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  let activeItem = ActiveItem.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  if(!itemCanceled){
    itemCanceled = new ItemCanceled(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  }

  itemCanceled.seller = event.params.seller
  itemCanceled.nftAddress = event.params.nftAddress
  itemCanceled.tokenId = event.params.tokenId
  activeItem!.buyer = Address.fromString("0x000000000000000000000000000000000000dEaD")//the dead address

  itemCanceled.save()
  activeItem!.save()

}

export function handleItemListed(event: ItemListedEvent): void {
  let itemlisted = ItemListed.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  let activeItem = ActiveItem.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  if(!itemlisted){
    itemlisted = new ItemListed(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  }
  if(!activeItem){
    activeItem = new ActiveItem(getIdFromEventParams(event.params.tokenId, event.params.nftAddress))
  }
  itemlisted.seller = event.params.seller
  activeItem.seller = event.params.seller

  itemlisted.nftAddress = event.params.nftAddress
  activeItem.nftAddress = event.params.nftAddress

  itemlisted.tokenId = event.params.tokenId
  activeItem.tokenId = event.params.tokenId

  itemlisted.price = event.params.price
  activeItem.price = event.params.price

  activeItem.buyer = Address.fromString("0x0000000000000000000000000000000000000000")

  itemlisted.save()
  activeItem.save()
}

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address) : string{
  return tokenId.toHexString() + nftAddress.toHexString()
}
