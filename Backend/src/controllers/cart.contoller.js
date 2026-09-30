import cartModel from '../models/cart.model.js'
import productModel from '../models/product.model.js'
import paymentModel from '../models/payment.model.js'
import { stockOfVariant } from '../dao/product.dao.js'
import mongoose from 'mongoose'
import { getCartDetails } from '../dao/cart.dao.js'
import { config } from '../config/config.js'

export const addToCart = async (req, res) => {
  try {
    const { productId, variantId } = req.params
    const { quantity = 1 } = req.body

    // Clean & Validate String Params
    const isVariantValid =
      variantId && variantId !== 'undefined' && variantId !== 'null'

    // Query product safely
    const query = { _id: productId }
    if (isVariantValid) {
      query['variants._id'] = variantId
    }

    const product = await productModel.findOne(query)

    if (!product) {
      return res.status(404).json({
        message: 'Product or variant not found',
        success: false
      })
    }

    // Fetch stock safely
    const stock = await stockOfVariant(
      productId,
      isVariantValid ? variantId : null
    )

    const cart =
      (await cartModel.findOne({ user: req.user._id })) ||
      (await cartModel.create({ user: req.user._id }))

    const targetVariantId = isVariantValid ? variantId : null

    const isProductAlreadyInCart = cart.items.some(
      item =>
        item.product.toString() === productId &&
        (targetVariantId ? item.variant?.toString() === targetVariantId : true)
    )

    if (isProductAlreadyInCart) {
      const quantityInCart = cart.items.find(
        item =>
          item.product.toString() === productId &&
          (targetVariantId
            ? item.variant?.toString() === targetVariantId
            : true)
      ).quantity

      if (quantityInCart + quantity > stock) {
        return res.status(400).json({
          message: `Only ${stock} items left in stock. and you already have ${quantityInCart} items in your cart`,
          success: false
        })
      }

      const updateFilter = { user: req.user._id, 'items.product': productId }
      if (targetVariantId) {
        updateFilter['items.variant'] = targetVariantId
      }

      await cartModel.findOneAndUpdate(
        updateFilter,
        { $inc: { 'items.$.quantity': quantity } },
        { new: true }
      )

      return res.status(200).json({
        message: 'Cart updated successfully',
        success: true
      })
    }

    if (quantity > stock) {
      return res.status(400).json({
        message: `Only ${stock} items left in stock`,
        success: false
      })
    }

    // Extract correct price schema object (variant price first, fallback to product price)
    const selectedVariant = isVariantValid
      ? product.variants?.find(v => v._id.toString() === variantId)
      : null

    const resolvedPrice = selectedVariant?.price || product.price

    cart.items.push({
      product: productId,
      variant: targetVariantId,
      quantity,
      price: {
        amount: resolvedPrice?.amount || resolvedPrice,
        currency: resolvedPrice?.currency || 'INR'
      }
    })

    await cart.save()

    return res.status(200).json({
      message: 'Product added to cart successfully',
      success: true
    })
  } catch (error) {
    console.error('addToCart Error:', error)
    return res.status(500).json({
      message: error.message || 'Internal server error',
      success: false
    })
  }
}

export const getCart = async (req, res) => {
  try {
    const user = req.user

    let cart = (await cartModel.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(user._id)
        }
      },
      { $unwind: { path: '$items' } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'items.product'
        }
      },
      { $unwind: { path: '$items.product' } },
      {
        $unwind: { path: '$items.product.variants' }
      },
      {
        $match: {
          $expr: {
            $eq: ['$items.variant', '$items.product.variants._id']
          }
        }
      },
      {
        $addFields: {
          itemPrice: {
            price: {
              $multiply: [
                '$items.quantity',
                '$items.product.variants.price.amount'
              ]
            },
            currency: '$items.product.variants.price.currency'
          }
        }
      },
      {
        $group: {
          _id: '$_id',
          totalPrice: { $sum: '$itemPrice.price' },
          currency: {
            $first: '$itemPrice.currency'
          },
          items: { $push: '$items' }
        }
      }
    ])) [0]

    if (!cart) {
      cart = await cartModel.create({ user: user._id })
    }

    return res.status(200).json({
      message: 'Cart fetched successfully',
      success: true,
      cart
    })
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false })
  }
}


export const incrementCartItemQuantity = async (req, res) => {
  try {
    const { productId, variantId } = req.params

    const isVariantValid =
      variantId && variantId !== 'undefined' && variantId !== 'null'

    const query = { _id: productId }
    if (isVariantValid) {
      query['variants._id'] = variantId
    }

    const product = await productModel.findOne(query)

    if (!product) {
      return res.status(404).json({
        message: 'Product or variant not found',
        success: false
      })
    }

    const cart = await cartModel.findOne({ user: req.user._id })

    if (!cart) {
      return res.status(404).json({
        message: 'Cart not found',
        success: false
      })
    }

    const stock = await stockOfVariant(
      productId,
      isVariantValid ? variantId : null
    )

    const targetVariantId = isVariantValid ? variantId : null

    const itemQuantityInCart =
      cart.items.find(
        item =>
          item.product.toString() === productId &&
          (targetVariantId
            ? item.variant?.toString() === targetVariantId
            : true)
      )?.quantity || 0

    if (itemQuantityInCart + 1 > stock) {
      return res.status(400).json({
        message: `Only ${stock} items left in stock. and you already have ${itemQuantityInCart} items in your cart`,
        success: false
      })
    }

    const updateFilter = { user: req.user._id, 'items.product': productId }
    if (targetVariantId) {
      updateFilter['items.variant'] = targetVariantId
    }

    await cartModel.findOneAndUpdate(
      updateFilter,
      { $inc: { 'items.$.quantity': 1 } },
      { new: true }
    )

    return res.status(200).json({
      message: 'Cart item quantity incremented successfully',
      success: true
    })
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false })
  }
}


export const createOrderController = async (req, res) => {

    const cart = await getCartDetails(req.user._id)

    if (!cart) {
        return res.status(400).json({
            message: "Cart is empty",
            success: false
        })
    }

    const order = await createOrder({ amount: cart.totalPrice, currency: cart.currency })

    const payment = await paymentModel.create({
        user: req.user._id,
        razorpay: {
            orderId: order.id,
        },
        price: {
            amount: cart.totalPrice,
            currency: cart.currency
        },
        orderItems: cart.items.map(item => ({
            title: item.product.title,
            productId: item.product._id,
            variantId: item.variant,
            quantity: item.quantity,
            images: item.product.variants.images || item.product.images,
            description: item.product.description,
            price: {
                amount: item.product.variants.price.amount || item.product.price.amount,
                currency: item.product.variants.price.currency || item.product.price.currency
            }
        }))
    })

    return res.status(200).json({
        message: "Order created successfully",
        success: true,
        order
    })
}