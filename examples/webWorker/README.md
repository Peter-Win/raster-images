# WebWorker demo

An example of using a webworker to load a bitmap.

Loading a file from a file is a heavy operation.
If you perform such operations in the main browser thread, the performance of the page may be disrupted. 
And the browser may consider the task frozen and cancel it.
WebWorker is the best way to perform heavy operations in a browser without affecting the main thread.

To launch this example:

Install: **yarn**

Start: **yarn start**
and open http://localhost:3001/

The main feature is that you cannot pass arbitrary objects between the main thread and the worker. Therefore, we have to use special structures with the Parcel prefix. For example, the image is transmitted using ParcelSurface.

template.html

index.ts - main thread

workerLoad.ts - WebWorker for image loadin