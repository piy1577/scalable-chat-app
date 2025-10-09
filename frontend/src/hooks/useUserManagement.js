import React, { useState, useEffect } from "react";
import socketService from "../services/socketService";

export const useUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [invitedUsers, setInvitedUsers] = useState([]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                if (socketService.isDemoMode) {
                    // In demo mode, directly load demo users
                    console.log("Loading demo users directly...");
                    const { mockAPI } = await import("../constants/demoData");
                    const demoUsers = await mockAPI.getUsers();
                    console.log(
                        "Loaded demo users:",
                        demoUsers.length,
                        demoUsers
                    );
                    setUsers(demoUsers);
                } else {
                    // In real mode, use socket service
                    socketService.getUsers();
                }
            } catch (error) {
                console.error("Error loading initial data:", error);
            }
        };

        // Load users - merge with existing users to preserve invited users
        const handleUsersLoad = (usersList) => {
            console.log("Loading users:", usersList.length, "users");
            // In demo mode, don't merge - just use the demo users
            if (socketService.isDemoMode) {
                console.log(
                    "Demo mode - setting users directly:",
                    usersList.length
                );
                setUsers(usersList);
                return;
            }

            // Always merge with existing users to preserve invited users
            setUsers((prevUsers) => {
                if (prevUsers.length === 0) {
                    console.log("Setting initial users:", usersList.length);
                    return usersList;
                } else {
                    // Subsequent loads - merge to preserve invited users
                    const combined = [...prevUsers, ...usersList];
                    // Remove duplicates based on id
                    const unique = combined.filter(
                        (user, index, self) =>
                            index === self.findIndex((u) => u.id === user.id)
                    );
                    console.log(
                        "Merging users - prev:",
                        prevUsers.length,
                        "new:",
                        usersList.length,
                        "combined:",
                        unique.length
                    );
                    return unique;
                }
            });
        };

        // Set up event listeners
        socketService.onUsersList(handleUsersLoad);

        // Load initial data
        loadInitialData();

        // Cleanup function
        return () => {
            socketService.off("users_list", handleUsersLoad);
        };
    }, []);

    // Combine loaded users and invited users
    const allUsers = React.useMemo(() => {
        const combined = [...users, ...invitedUsers];
        return combined;
    }, [users, invitedUsers]);

    const inviteUser = async (email) => {
        try {
            console.log("Inviting user with email:", email);

            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Check if user is already invited or exists
            const existingUser = [...users, ...invitedUsers].find(
                (user) =>
                    user.email === email || user.name === email.split("@")[0]
            );

            if (existingUser) {
                alert(`User ${email} is already in your contacts!`);
                return;
            }

            // Create new invited user
            const newUser = {
                id: `invited-${Date.now()}`,
                name: email.split("@")[0], // Use part before @ as name
                email: email,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    email.split("@")[0]
                )}&background=667eea&color=ffffff&size=128`,
                status: "offline",
                lastSeen: new Date(),
                lastMessage: null,
                isInvited: true, // Mark as invited user
            };

            setInvitedUsers((prevInvited) => [...prevInvited, newUser]);

            alert(
                `Invitation sent to ${email}! They will appear in your contacts once they accept.`
            );
        } catch (error) {
            console.error("Error sending invitation:", error);
            throw new Error("Failed to send invitation. Please try again.");
        }
    };
    console.log(allUsers);
    return { users, invitedUsers, allUsers, inviteUser };
};
