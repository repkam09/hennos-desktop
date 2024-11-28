import { useEffect, useState } from 'react';
import Markdown from 'marked-react';

type ChatContext = ChatTextContent | ChatImageContent;

type ChatTextContent = {
    type: "text",
    content: string
    role: string
}

type ChatImageContent = {
    type: "image",
    encoded: string
    role: string
}

function lifeforceApiCallGet<T>(path: string, token: string): Promise<T> {
    return fetch("https://api.repkam09.com" + path, {
        headers: {
            "repka-verify": token
        }
    }).then((response) => {
        return response.json();
    })
}

function useHennosUserChat() {
    const [chatId, setChatId] = useState("");
    const [authToken, setAuthToken] = useState("");
    const [lastLoaded, setLastLoaded] = useState(0);
    const [chatContext, setChatContext] = useState<ChatContext[]>([]);

    function handleChatIdChange(newChatId: string) {
        setChatId(newChatId);
    }

    function handleAuthTokenChange(newAuthToken: string) {
        setAuthToken(newAuthToken);
    }

    useEffect(() => {
        if (lastLoaded === 0) {
            return;
        }
        
        if (chatId === "") {
            window.alert("Chat ID is not set.");
            return;
        }

        if (authToken === "") {
            window.alert("Auth Token is not set.");
            return;
        }

        lifeforceApiCallGet<ChatContext[]>("/api/hennos/chat/" + chatId, authToken).then((data) => {
            setChatContext(data.reverse());
        })
    }, [chatId, authToken, lastLoaded]);

    const inputProps = {
        chatContext,
        chatId: {
            value: chatId,
            onChange: handleChatIdChange
        },
        authToken: {
            value: authToken,
            onChange: handleAuthTokenChange
        },
        reload: () => setLastLoaded(lastLoaded + 1)
    }

    return inputProps;
}

function App() {
    const [chatIdInput, setChatIdInput] = useState("");
    const [authTokenInput, setAuthTokenInput] = useState("");

    const { chatContext, chatId, authToken, reload } = useHennosUserChat();

    const chatlist = chatContext.map((entry) => {
        if (entry.type === "image") {
            return (
                <li className='chat-entry'>
                    <div className='chat-role'>{entry.role}</div>
                    <img className='chat-content-image' src={`data:image/png;base64,${entry.encoded}`} />
                </li>
            );
        }
        if (entry.type === "text") {
            return (
                <li className='chat-entry'>
                    <div className='chat-role'>{entry.role}</div>
                    <div className='chat-content-text'>
                        <Markdown gfm={true} breaks={true}>{entry.content}</Markdown>
                    </div>
                </li>
            );
        }

        return null;
    });

    return (
        <div id="app">
            <div className='chat-settings'>
                <div className='chat-settings-input'>
                    <span>ChatID: </span>
                    <input type="text" value={chatIdInput} onChange={(e) => setChatIdInput(e.target.value)} />
                </div>

                <div className='chat-settings-input'>
                    <span>Token: </span>
                    <input type="text" value={authTokenInput} onChange={(e) => setAuthTokenInput(e.target.value)} />
                </div>
                <div className='chat-settings-button'>
                    <button onClick={() => {
                        chatId.onChange(chatIdInput);
                        authToken.onChange(authTokenInput)
                    }}>Load</button>
                </div>
                <div className='chat-settings-button'>
                    <button onClick={reload}>Refresh</button>
                </div>                
            </div>

            <section>
                <ul className='chat-list'>
                    {chatlist}
                </ul>
            </section>
        </div>
    )
}

export default App
