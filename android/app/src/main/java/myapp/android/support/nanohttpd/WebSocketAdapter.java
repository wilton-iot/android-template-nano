/*
 * Copyright 2018, alex at staticlibs.net
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package myapp.android.support.nanohttpd;

import java.io.IOException;
import org.nanohttpd.protocols.http.IHTTPSession;
import org.nanohttpd.protocols.websockets.WebSocket;
import org.nanohttpd.protocols.websockets.CloseCode;
import org.nanohttpd.protocols.websockets.WebSocketFrame;

public class WebSocketAdapter extends WebSocket {

    private final WebSocketInterface impl;

    public WebSocketAdapter(WebSocketInterface impl, IHTTPSession handshake) {
        super(handshake);
        this.impl = impl;
    }

    @Override
    protected void onOpen() {
        impl.onOpen(this);
    }

    @Override
    protected void onClose(CloseCode code, String reason, boolean initiatedByRemote) {
        impl.onClose(code, reason, initiatedByRemote, this);
    }

    @Override
    protected void onMessage(WebSocketFrame message) {
        impl.onMessage(message, this);
    }

    @Override
    protected void onPong(WebSocketFrame pong) {
        impl.onPong(pong, this);
    }

    @Override
    protected void onException(IOException exception) {
        impl.onException(exception, this);
    }
}
