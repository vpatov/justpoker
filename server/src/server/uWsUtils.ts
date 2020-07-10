// @ts-nocheck
export function ab2str2json(buf) {
    return JSON.parse(String.fromCharCode.apply(null, new Uint8Array(buf)));
}

/* Helper function for reading a posted JSON body */
export function readJson(res, cb, err) {
    let buffer;
    /* Register data cb */
    res.onData((ab, isLast) => {
        const chunk = Buffer.from(ab);
        if (isLast) {
            let json;
            if (buffer) {
                try {
                    json = JSON.parse(Buffer.concat([buffer, chunk]));
                } catch (e) {
                    /* res.close calls onAborted */
                    res.close();
                    return;
                }
                cb(json);
            } else {
                try {
                    json = JSON.parse(chunk);
                } catch (e) {
                    /* res.close calls onAborted */
                    res.close();
                    return;
                }
                cb(json);
            }
        } else {
            if (buffer) {
                buffer = Buffer.concat([buffer, chunk]);
            } else {
                buffer = Buffer.concat([chunk]);
            }
        }
    });

    /* Register error cb */
    res.onAborted(err);
}

/* Helper function converting Node.js buffer to ArrayBuffer */
function toArrayBuffer(buffer) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

/* Either onAborted or simply finished request */
function onAbortedOrFinishedResponse(res, readStream) {
    if (res.id == -1) {
        console.log('ERROR! onAbortedOrFinishedResponse called twice for the same res!');
    } else {
        readStream.destroy();
    }

    /* Mark this response already accounted for */
    res.id = -1;
}

/* Helper function to pipe the ReadaleStream over an Http responses */
export function pipeStreamOverResponse(res, readStream, totalSize) {
    /* Careful! If Node.js would emit error before the first res.tryEnd, res will hang and never time out */
    /* For this demo, I skipped checking for Node.js errors, you are free to PR fixes to this example */
    readStream
        .on('data', (chunk) => {
            /* We only take standard V8 units of data */
            const ab = toArrayBuffer(chunk);

            /* Store where we are, globally, in our response */
            const lastOffset = res.getWriteOffset();

            /* Streaming a chunk returns whether that chunk was sent, and if that chunk was last */
            const [ok, done] = res.tryEnd(ab, totalSize);

            /* Did we successfully send last chunk? */
            if (done) {
                onAbortedOrFinishedResponse(res, readStream);
            } else if (!ok) {
                /* If we could not send this chunk, pause */
                readStream.pause();

                /* Save unsent chunk for when we can send it */
                res.ab = ab;
                res.abOffset = lastOffset;

                /* Register async handlers for drainage */
                res.onWritable((offset) => {
                    /* Here the timeout is off, we can spend as much time before calling tryEnd we want to */

                    /* On failure the timeout will start */
                    const [ok, done] = res.tryEnd(res.ab.slice(offset - res.abOffset), totalSize);
                    if (done) {
                        onAbortedOrFinishedResponse(res, readStream);
                    } else if (ok) {
                        /* We sent a chunk and it was not the last one, so let's resume reading.
                         * Timeout is still disabled, so we can spend any amount of time waiting
                         * for more chunks to send. */
                        readStream.resume();
                    }

                    /* We always have to return true/false in onWritable.
                     * If you did not send anything, return true for success. */
                    return ok;
                });
            }
        })
        .on('error', () => {
            /* Todo: handle errors of the stream, probably good to simply close the response */
            console.log('Unhandled read error from Node.js, you need to handle this!');
        });

    /* If you plan to asyncronously respond later on, you MUST listen to onAborted BEFORE returning */
    res.onAborted(() => {
        onAbortedOrFinishedResponse(res, readStream);
    });
}
