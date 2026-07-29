import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [], // Array of product IDs
    },
    reducers: {
        toggleWishlist: (state, action) => {
            const productId = action.payload;
            const exists = state.items.includes(productId);
            if (exists) {
                state.items = state.items.filter(id => id !== productId);
            } else {
                state.items.push(productId);
            }
        },
        setWishlist: (state, action) => {
            state.items = action.payload || [];
        },
        clearWishlist: (state) => {
            state.items = [];
        }
    }
});

export const { toggleWishlist, setWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
