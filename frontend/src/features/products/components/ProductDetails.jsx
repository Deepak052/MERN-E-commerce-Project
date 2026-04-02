import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { clearSelectedProduct, fetchProductByIdAsync, resetProductFetchStatus, selectProductFetchStatus, selectSelectedProduct } from '../ProductSlice'
import { Box, Checkbox, Rating, Stack, Typography, useMediaQuery, Button } from '@mui/material'
import { addToCartAsync, resetCartItemAddStatus, selectCartItemAddStatus, selectCartItems } from '../../cart/CartSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { fetchReviewsByProductIdAsync, resetReviewFetchStatus, selectReviewFetchStatus, selectReviews } from '../../review/ReviewSlice'
import { Reviews } from '../../review/components/Reviews'
import { toast } from 'react-toastify'
import { MotionConfig, motion } from 'framer-motion'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import Favorite from '@mui/icons-material/Favorite'
import { createWishlistItemAsync, deleteWishlistItemByIdAsync, resetWishlistItemAddStatus, resetWishlistItemDeleteStatus, selectWishlistItemAddStatus, selectWishlistItemDeleteStatus, selectWishlistItems } from '../../wishlist/WishlistSlice'
import { useTheme } from '@mui/material'
import LottieComponent from "lottie-react";
import { loadingAnimation } from '../../../assets'

// ✅ Swiper
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Pagination, Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/navigation"

const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const COLORS = ['#020202', '#F6F6F6', '#B82222', '#BEA9A9', '#E2BB8D']

const Lottie = LottieComponent.default || LottieComponent;

export const ProductDetails = () => {

    const { id } = useParams()
    const product = useSelector(selectSelectedProduct)
    const loggedInUser = useSelector(selectLoggedInUser)
    const dispatch = useDispatch()
    const cartItems = useSelector(selectCartItems)
    const cartItemAddStatus = useSelector(selectCartItemAddStatus)
    const [quantity, setQuantity] = useState(1)
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColorIndex, setSelectedColorIndex] = useState(-1)
    const reviews = useSelector(selectReviews)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    const theme = useTheme()
    const is1420 = useMediaQuery(theme.breakpoints.down(1420))
    const is990 = useMediaQuery(theme.breakpoints.down(990))
    const is840 = useMediaQuery(theme.breakpoints.down(840))
    const is500 = useMediaQuery(theme.breakpoints.down(500))
    const is480 = useMediaQuery(theme.breakpoints.down(480))
    const is387 = useMediaQuery(theme.breakpoints.down(387))
    const is340 = useMediaQuery(theme.breakpoints.down(340))

    const wishlistItems = useSelector(selectWishlistItems)

    const isProductAlreadyInCart = cartItems.some((item) => item.product._id === id)
    const isProductAlreadyinWishlist = wishlistItems.some((item) => item.product._id === id)

    const productFetchStatus = useSelector(selectProductFetchStatus)
    const reviewFetchStatus = useSelector(selectReviewFetchStatus)

    const totalReviewRating = reviews.reduce((acc, review) => acc + review.rating, 0)
    const totalReviews = reviews.length
    const averageRating = parseInt(Math.ceil(totalReviewRating / totalReviews))

    const wishlistItemAddStatus = useSelector(selectWishlistItemAddStatus)
    const wishlistItemDeleteStatus = useSelector(selectWishlistItemDeleteStatus)

    const navigate = useNavigate()

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" })
    }, [])

    useEffect(() => {
        if (id) {
            dispatch(fetchProductByIdAsync(id))
            dispatch(fetchReviewsByProductIdAsync(id))
        }
    }, [id])

    useEffect(() => {
        if (cartItemAddStatus === 'fulfilled') toast.success("Product added to cart")
        else if (cartItemAddStatus === 'rejected') toast.error('Error adding product')
    }, [cartItemAddStatus])

    useEffect(() => {
        return () => {
            dispatch(clearSelectedProduct())
            dispatch(resetProductFetchStatus())
            dispatch(resetReviewFetchStatus())
            dispatch(resetWishlistItemDeleteStatus())
            dispatch(resetWishlistItemAddStatus())
            dispatch(resetCartItemAddStatus())
        }
    }, [])

    const handleAddToCart = () => {
        const item = { user: loggedInUser._id, product: id, quantity }
        dispatch(addToCartAsync(item))
    }

    const handleDecreaseQty = () => {
        if (quantity !== 1) setQuantity(quantity - 1)
    }

    const handleIncreaseQty = () => {
        if (quantity < 20 && quantity < product.stockQuantity) setQuantity(quantity + 1)
    }

    const handleAddRemoveFromWishlist = (e) => {
        if (e.target.checked) {
            dispatch(createWishlistItemAsync({ user: loggedInUser?._id, product: id }))
        } else {
            const index = wishlistItems.findIndex((item) => item.product._id === id)
            dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id))
        }
    }

    return (
        <Stack alignItems="center" mb={5}>

            {(productFetchStatus === 'pending') ?
                <Lottie animationData={loadingAnimation} />
                :
                <Stack direction={is840 ? "column" : "row"} gap={5}>

                    {/* LEFT SIDE */}
                    <Stack direction="row" gap={3}>

                        {/* thumbnails */}
                        {!is1420 && (
                            <Stack gap={2}>
                                {product?.images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        width={100}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSelectedImageIndex(i)}
                                    />
                                ))}
                            </Stack>
                        )}

                        {/* MAIN IMAGE / SWIPER */}
                        <Stack mt={5} width={is990 ? 400 : 500}>

                            {is1420 ? (
                                <Swiper
                                    modules={[Autoplay, Pagination, Navigation]}
                                    autoplay={{ delay: 3000 }}
                                    loop
                                    pagination={{ clickable: true }}
                                    navigation
                                >
                                    {product?.images.map((img, i) => (
                                        <SwiperSlide key={i}>
                                            <Box
                                                component="img"
                                                src={img}
                                                sx={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain' }}
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            ) : (
                                <img
                                    src={product?.images[selectedImageIndex]}
                                    style={{ width: '100%' }}
                                />
                            )}

                        </Stack>
                    </Stack>

                    {/* RIGHT SIDE */}
                    <Stack gap={2} width={300}>
                        <Typography variant="h4">{product?.title}</Typography>
                        <Rating value={averageRating} readOnly />
                        <Typography>${product?.price}</Typography>

                        {/* quantity */}
                        <Stack direction="row" gap={2}>
                            <button onClick={handleDecreaseQty}>-</button>
                            <span>{quantity}</span>
                            <button onClick={handleIncreaseQty}>+</button>
                        </Stack>

                        {/* add to cart */}
                        <Button variant="contained" onClick={handleAddToCart}>
                            {isProductAlreadyInCart ? "Go to Cart" : "Add to Cart"}
                        </Button>

                        {/* wishlist */}
                        <Checkbox
                            checked={isProductAlreadyinWishlist}
                            onChange={handleAddRemoveFromWishlist}
                            icon={<FavoriteBorder />}
                            checkedIcon={<Favorite color="error" />}
                        />
                    </Stack>

                </Stack>
            }
        </Stack>
    )
}