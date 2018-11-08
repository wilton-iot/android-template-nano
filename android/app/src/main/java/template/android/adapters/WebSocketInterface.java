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

package template.android.adapters;

import java.io.IOException;
import org.nanohttpd.protocols.websockets.CloseCode;
import org.nanohttpd.protocols.websockets.WebSocketFrame;

public interface WebSocketInterface {

    void onOpen(WebSocketAdapter adapter);

    void onClose(CloseCode code, String reason, boolean initiatedByRemote, WebSocketAdapter adapter);

    void onMessage(WebSocketFrame message, WebSocketAdapter adapter);

    void onPong(WebSocketFrame pong, WebSocketAdapter adapter);

    void onException(IOException exception, WebSocketAdapter adapter);
}
