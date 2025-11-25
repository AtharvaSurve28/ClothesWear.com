document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("edit-profile-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const bioInput = document.getElementById("bio");
    const avatarGroup = document.querySelector(".avatar-group");
    const avatarPreview = document.getElementById("avatar-preview");
    const avatarUpload = document.getElementById("avatar-upload");

    let selectedAvatarFile = null;

    const loadProfileData = async () => {
        try {
            const response = await fetch("/api/profile");
            if (!response.ok) throw new Error("Could not fetch profile data.");
            const data = await response.json();

            nameInput.value = data.name;
            emailInput.value = data.email;
            bioInput.value = data.bio || "";
            avatarPreview.src = data.avatarUrl;
        } catch (error) {
            console.error("Error loading profile data:", error);
            alert("Could not load profile data.");
        }
    };

    // Trigger file upload when the avatar group is clicked
    avatarGroup.addEventListener("click", () => {
        avatarUpload.click();
    });

    // Also trigger on keypress for accessibility
    avatarGroup.addEventListener("keyup", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            avatarUpload.click();
        }
    });

    avatarUpload.addEventListener("change", () => {
        if (avatarUpload.files && avatarUpload.files[0]) {
            selectedAvatarFile = avatarUpload.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(selectedAvatarFile);
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (selectedAvatarFile) {
            const formData = new FormData();
            formData.append("avatar", selectedAvatarFile);

            try {
                const uploadResponse = await fetch("/api/profile/avatar", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadResponse.ok) throw new Error("Avatar upload failed.");

            } catch (error) {
                console.error("Error uploading avatar:", error);
                alert("Could not upload your new avatar. Please try again.");
                return;
            }
        }

        const updatedProfile = {
            name: nameInput.value,
            email: emailInput.value,
            bio: bioInput.value,
        };

        try {
            const profileResponse = await fetch("/api/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedProfile),
            });

            if (!profileResponse.ok) throw new Error("Failed to update profile details.");

            alert("Profile updated successfully!");
            window.location.href = "profile.html";

        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred while updating your profile.");
        }
    });

    loadProfileData();
});
