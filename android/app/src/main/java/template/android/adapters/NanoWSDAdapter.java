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

import org.nanohttpd.protocols.http.IHTTPSession;
import org.nanohttpd.protocols.http.response.Response;
import org.nanohttpd.protocols.websockets.NanoWSD;

public class NanoWSDAdapter extends NanoWSD {
    
    private final NanoWSDInterface impl;

    public NanoWSDAdapter(NanoWSDInterface impl, String hostname, int port) {
        super(hostname, port);
        this.impl = impl;
    }

    @Override
    protected Response serve(IHTTPSession session) {
        return impl.serve(session, this);
    }

    @Override
    protected WebSocketAdapter openWebSocket(IHTTPSession handshake) {
        return impl.openWebSocket(handshake, this);
    }
}
