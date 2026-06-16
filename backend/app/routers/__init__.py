from fastapi import APIRouter
from app.routers import auth, products, categories, cart, orders, wishlist, reviews, blog, uploads, users, customers, addresses, chat, support, analytics, charity

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(categories.router)
api_router.include_router(products.router)
api_router.include_router(cart.router)
api_router.include_router(orders.router)
api_router.include_router(wishlist.router)
api_router.include_router(reviews.router)
api_router.include_router(blog.router)
api_router.include_router(uploads.router)
api_router.include_router(customers.router)
api_router.include_router(addresses.router)
api_router.include_router(chat.router)
api_router.include_router(support.router)
api_router.include_router(analytics.router)
api_router.include_router(charity.router)

