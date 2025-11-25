document.addEventListener("DOMContentLoaded", () => {
    const loadProfile = async () => {
        try {
            const response = await fetch("/api/profile");
            if (!response.ok) {
                throw new Error("Could not fetch profile data.");
            }
            const profile = await response.json();

            document.querySelector(".profile-avatar").src = profile.avatarUrl;
            document.querySelector(".profile-avatar").alt = `${profile.name}'s Avatar`;
            document.querySelector(".profile-name").textContent = profile.name;
            document.querySelector(".profile-email").textContent = profile.email;
            document.querySelector(".profile-bio").textContent = profile.bio; // Display the bio

        } catch (error) {
            console.error("Error loading profile data:", error);
            const profileContainer = document.querySelector(".profile-header");
            if(profileContainer){
                profileContainer.innerHTML = "<p>We could not load your profile at this moment. Please try again later.</p>";
            }
        }
    };

    const loadOrders = async () => {
        try {
            const response = await fetch("/api/orders");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const orders = await response.json();
            const ordersContainer = document.querySelector("#orders-list");

            if (ordersContainer) {
                if (orders.length > 0) {
                    ordersContainer.innerHTML = orders.map(order => `
                        <div class="list-item">
                            <p><strong>Order ID:</strong> ${order.orderId}</p>
                            <p><strong>Status:</strong> ${order.status}</p>
                            <p><strong>Date:</strong> ${order.deliveryDate}</p>
                        </div>
                    `).join("");
                } else {
                    ordersContainer.innerHTML = "<p>You have no recent orders.</p>";
                }
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            document.querySelector("#orders-list").innerHTML = "<p>Could not load orders.</p>";
        }
    };

    const loadWishlist = async () => {
        try {
            const response = await fetch("/api/wishlist");
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const wishlist = await response.json();
            const wishlistContainer = document.querySelector("#wishlist-list");

            if (wishlistContainer) {
                if (wishlist.length > 0) {
                    wishlistContainer.innerHTML = wishlist.map(item => `
                        <div class="list-item">
                            <p><strong>${item.itemName}</strong></p>
                            <p>Added on: ${item.dateAdded}</p>
                        </div>
                    `).join("");
                } else {
                    wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
                }
            }
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            document.querySelector("#wishlist-list").innerHTML = "<p>Could not load wishlist.</p>";
        }
    };

    loadProfile();
    loadOrders();
    loadWishlist();
});
