import { createContext } from "react";
import { getRequest, baseUrl, postRequest } from "../utils/service";
import { useState } from "react";
import { useEffect } from "react";
import { useCallback } from "react";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState(null);
    const [isUserChatLoading, setIsUserChatLoading] = useState(false);
    const [userChatError, setUserChatsError] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessageLoading, setMessageLoading] = useState(false);
    const [messageError, setMessageError] = useState(null);
    const [sendTextMessageError, setSendTextMessageError] = useState(null);
    const [newMessage, SetNewMessage] = useState(null)
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [notification, setNotification] = useState([]);
    const [allUsers, setAllUsers]= useState([]);

    console.log("Notification", notification)

    //initial socket
    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        return () => {
            newSocket.disconnect()
        }
    }, [user])

    // add online users
    useEffect(() => {
        if (socket === null) return
        socket.emit("addNewUser", user?._id);
        socket.on("getOnlineUsers", (res) => {
            setOnlineUsers(res)
        })

        return () => {
            socket.off("getOnlineUsers")
        }
    }, [socket])

    // send message live
    useEffect(() => {
        if (socket === null) return

        if (!newMessage) return;

        if (currentChat?.isGroup) {
            // For group, send to all members except sender
            socket.emit("sendMessage", {
                ...newMessage,
                isGroup: true,
                groupMembers: currentChat.members,
                groupName: currentChat.name,
            });
        } else {
            const recipientId = currentChat?.members.find((id) => id !== user?._id)
            socket.emit("sendMessage", { ...newMessage, recipientId });
        }
    }, [newMessage])

    // recieve messages and notification
    useEffect(() => {
        if (socket === null) return

        socket.on("getMessage", res => {
            // Only append message if it belongs to the currently open chat
            if (currentChat?._id !== res.chatId) return
            setMessages((prev) => [...prev, res])
            // Move the chat to top for the receiver as well
            setUserChats(prev => {
                if (!prev) return prev;
                const idx = prev.findIndex(c => c._id === res.chatId);
                if (idx === -1) return prev;
                const chatToMove = prev[idx];
                if (idx === 0) return prev;
                return [chatToMove, ...prev.filter((_, i) => i !== idx)];
            });
        })

        socket.on("getNotification", (res) => {
            // Only mark as read notifications for the currently open chat and only for the new notification
            if (currentChat?._id === res.chatId) {
                setNotification(prev =>
                    prev.map(n =>
                        n.chatId === res.chatId && !n.isRead
                            ? { ...n, isRead: true }
                            : n
                    )
                );
            } else {
                setNotification(prev => [res, ...prev])
            }
            // Move the chat to top for ALL users when a new notification/message is received
            setUserChats(prev => {
                if (!prev) return prev;
                const idx = prev.findIndex(c => c._id === res.chatId);
                if (idx === -1) return prev;
                const chatToMove = prev[idx];
                if (idx === 0) return prev;
                return [chatToMove, ...prev.filter((_, i) => i !== idx)];
            });
        })

        return () => {
            socket.off("getMessage");
            socket.off("getNotification");
        }

    }, [socket, currentChat])

    useEffect(() => {
        const getUsers = async () => {
            const response = await getRequest(`${baseUrl}/users`);
            if (response.error) {
                return console.log("Error fetching users", response)
            }

            const pChats = response.filter((u) => {
                let isChatCreated = false;
                if (user?._id === u._id) return false;

                if (userChats) {
                    isChatCreated = userChats?.some((chat) => {
                        return chat.members[0] === u._id || chat.members[1] === u._id
                    })
                }

                return !isChatCreated;

            })
            setPotentialChats(pChats);
            setAllUsers(response);

        }
        getUsers()
    }, [ user, userChats])

    useEffect(() => {
        const getUserChats = async () => {
            if (user?._id) {

                setIsUserChatLoading(true)
                setUserChatsError(null);

                const response = await getRequest(`${baseUrl}/chats/${user?._id}`)

                setIsUserChatLoading(false)
                if (response.error) {
                    return setUserChatsError(response)
                }
                setUserChats(response)
            }
        }

        getUserChats()
    }, [user,notification])

    useEffect(() => {
        const getMessages = async () => {


            setMessageLoading(true)
            setMessageError(null);

            const response = await getRequest(`${baseUrl}/messages/${currentChat?._id}`)

            setMessageLoading(false)
            if (response.error) {
                return setMessageError(response)
            }
            setMessages(response)

        }

        getMessages()
    }, [currentChat])

    // When sending a message, move the chat to top
    const sendTextMessage = useCallback(async (textMessage, sender, setTextMessage, currentChatId) => {
        if (!textMessage) return console.log("You must type something");
        const response = await postRequest(
            `${baseUrl}/messages`,
            JSON.stringify({
                chatId: currentChatId,
                senderId: sender._id,
                text: textMessage,
            })
        );
        if (response.error) {
            return setSendTextMessageError(response)
        }

        SetNewMessage(response);
        setMessages((prev) => [...prev, response])
        setTextMessage("");
        // Move the chat to top after sending a message
        setUserChats(prev => {
            if (!prev) return prev;
            const idx = prev.findIndex(c => c._id === currentChatId);
            if (idx === -1) return prev;
            const chatToMove = prev[idx];
            return [chatToMove, ...prev.filter((_, i) => i !== idx)];
        });
    }, [])

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat)
    }, [])

    const createChats = useCallback(async (firstId, secondId) => {
        const response = await postRequest(`${baseUrl}/chats`, JSON.stringify({ firstId, secondId })

        );
        if (response.error) {
            return console.log("Error Creating Chats");
        }

        setUserChats((prev) => [...prev, response]);

    }, [])

    //mark all messge as read

    const markAllNotificationsAsRead = useCallback((notification) => {
        if (!currentChat?._id) return;
        const mNotifications = notification.map(n =>
            n.chatId === currentChat._id && !n.isRead
                ? { ...n, isRead: true }
                : n
        );
        setNotification(mNotifications)
    },[currentChat])

    // read message as well as open chat
    const MarkNotificationAsRead = useCallback((n, userChats, user, notification) => {
        // find chat by chatId
        const desiredChat = userChats.find(chat => chat._id === n.chatId);

        // Only mark notifications for this chatId as read
        const mNotifications = notification.map(el => {
            if (el.chatId === n.chatId && !el.isRead) {
                return { ...el, isRead: true }
            } else {
                return el
            }
        })

        updateCurrentChat(desiredChat)
        setNotification(mNotifications)
    },[])

    const markThisUserNotificationAsRead = useCallback((thisUserNotification, notification) => {
        // mark notification as read

        const mNotifications= notification.map(el => {
            let notifications;
            thisUserNotification.forEach(n => {
                if(n.senderId === el.senderId){
                    notification = {...n, isRead:true}
                } else{
                    notification = el;
                }
            });

            return notification
        })

        setNotification(mNotifications)
    },[])

    // Listen for group update events
    useEffect(() => {
        if (!socket || !user || !user._id) return;
        socket.on("groupUpdated", ({ chat }) => {
            setUserChats(prev => {
                if (!prev) return [];
                // If user is still in the group
                if (chat.isGroup) {
                    if (chat.members.includes(user._id)) {
                        // If group already in list, update it; else, add it
                        const exists = prev.some(c => c._id === chat._id);
                        if (exists) {
                            return prev.map(c => c._id === chat._id ? chat : c);
                        } else {
                            return [...prev, chat];
                        }
                    } else {
                        // Remove the group chat from the list
                        return prev.filter(c => c._id !== chat._id);
                    }
                }
                // For 1-1 chats, do not touch
                return prev;
            });
            setCurrentChat(prev =>
                prev && prev._id === chat._id && chat.isGroup && !chat.members.includes(user._id)
                    ? null
                    : prev && prev._id === chat._id
                        ? chat
                        : prev
            );
        });
        socket.on("groupDeleted", ({ chatId }) => {
            setUserChats(prev => prev ? prev.filter(c => c._id !== chatId) : []);
            setCurrentChat(prev => (prev && prev._id === chatId ? null : prev));
        });
        return () => {
            socket.off("groupUpdated");
            socket.off("groupDeleted");
        };
    }, [socket, user && user._id]);

    // --- Add these helper functions for group actions ---
    const emitGroupUpdate = useCallback((chat) => {
        if (socket && chat) {
            socket.emit("groupUpdated", { chat });
        }
    }, [socket]);

    const emitGroupDelete = useCallback((chatId) => {
        if (socket && chatId) {
            socket.emit("groupDeleted", { chatId });
        }
    }, [socket]);

    // --- Export these helpers for use in ChatBox ---
    return (
        <ChatContext.Provider value={{
            userChats,
            userChatError,
            isUserChatLoading,
            potentialChats,
            createChats,
            updateCurrentChat,
            messageError,
            messages,
            isMessageLoading,
            currentChat,
            setCurrentChat,
            sendTextMessage,
            onlineUsers,
            notification,
            allUsers,
            markAllNotificationsAsRead,
            MarkNotificationAsRead,
            markThisUserNotificationAsRead,
            emitGroupUpdate,
            emitGroupDelete,
        }}>
            {children}
        </ChatContext.Provider>
    )
}