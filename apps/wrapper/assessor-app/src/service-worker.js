
//  const inspectionsCache = 'inspections';
//  const formStatusCache = "formstatus";
//  const coursesCache= "courses";
//  const assessorCache= "assessor";

// self.addEventListener('fetch', (event) => {
//   console.log(event)
//   ///
//   if (event.request.method ==='POST' && event.request.url.includes('Inspections' ))  {
//     event.respondWith(handleNonGetRequest(event.request, inspectionsCache));
//   }

//   if (event.request.method ==='POST' && event.request.url.includes('getFormStatus' ))  {
//     event.respondWith(handleNonGetRequest(event.request, formStatusCache));
//   }

//   if (event.request.method ==='POST' && event.request.url.includes('Course' ))  {
//     event.respondWith(handleNonGetRequest(event.request, coursesCache));
//   }

//   if (event.request.method ==='POST' && (event.request.url.includes('getAssessor') || event.request.url.includes('getValidation')))  {
//     event.respondWith(handleNonGetRequest(event.request, assessorCache));
//   }

//   if (event.request.method ==='POST' && event.request.url.includes('prefillXML'))  {
//     event.respondWith(handleNonGetRequest(event.request, "prefill"));
//   }

//   // if (event.request.method ==='POST' && event.request.url.includes('graphql'))  {
//   //   event.respondWith(handleGraphQlRequest(event.request));
//   // }

//   if (event.request.method === 'POST' && event.request.url.includes('form-endpoint')) {
//     // Cache the form data with a unique identifier
//     event.respondWith(handleFormSubmission(event.request));
//   }
// }); 











// -----------------


/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute , NavigationRoute} from 'workbox-routing';
import { StaleWhileRevalidate,CacheFirst,NetworkFirst } from 'workbox-strategies';
import {CacheableResponsePlugin} from 'workbox-cacheable-response';

clientsClaim();

self.skipWaiting();

// Precache all of the assets generated by your build process.
// Their URLs are injected into the manifest variable below.
// This variable must be present somewhere in your service worker file,
// even if you decide not to use precaching. See https://cra.link/PWA
precacheAndRoute(self.__WB_MANIFEST);

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== 'navigate') {
      return false;
    } // If this is a URL that starts with /_, skip.

    if (url.pathname.startsWith('/_')) {
      return false;
    } // If this looks like a URL for a resource, because it contains // a file extension, skip.

    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    } // Return true to signal that we want to use the handler.

    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// An example runtime caching route for requests that aren't handled by the
// precache, in this case same-origin .png requests like those from in public/
registerRoute(
  // Add in any other file extensions or routing criteria as needed.
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'), // Customize this strategy as needed, e.g., by changing to CacheFirst.
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  })
);






self.addEventListener('fetch', (event) => {
  ///
 
  if (event.request.method ==='POST') {
    event.respondWith(handleNonGetRequests(event.request, event.request.url));
  } 

}); 

/* async function loadJS() {
  let cacheName="enketowebformjs";
  console.log("loadJSloadJSloadJSloadJS")
  const cache = await caches.open(cacheName);
const cacheKey = "enketowebformjs";

await cache.put(cacheKey, ars);

  
} */

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('my-cache').then(cache => {
      return cache.addAll([
        'enketo-webform.js',
        'theme-kobo.css',
        'theme-kobo.print.css',
        'OpenSans-Bold-webfont.woff',
        'fontawesome-webfont.woff',
        'OpenSans-Regular-webfont.woff'
      ]);
    })
  );
});

 async function handleNonGetRequests(request, url) {
  console.log(url)
  //loadJS();
  let cacheName="other";

  if( url.includes('Inspections')){
    console.log('InspectionsInspectionsInspections')
    cacheName = 'inspections';
  } else if (url.includes('Course')){
    console.log('coursescoursescourses')
    cacheName = 'courses';
  } else if(url.includes('Assessor')){
    console.log('AssessorAssessorAssessor')
    cacheName = 'assessor';
  }

  // Use a cache specifically for non-GET requests
  const cache = await caches.open(cacheName);
  const cacheKey = generateCacheKey(request);
   // Check if the response is already cached
   const cachedResponse = await cache.match(cacheKey);
   if (cachedResponse) {
     return cachedResponse;
   }
  // Fetch the network response
  const networkResponse = await fetch(request.clone());
  const clonedResponse = networkResponse.clone();
  // Clone and cache the network response for future use
    await cache.put(cacheKey, clonedResponse);
  return networkResponse;

} 

function generateCacheKey(request) {
  // This is a simplified example; customize it based on your needs
  return request.url + JSON.stringify(request.clone().body);
}
// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
/* self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); */

// Any other custom service worker logic can go here.

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-form-data') {
    event.waitUntil(syncFormData());
  }
});


async function handleFormSubmission(request) {
  if (!navigator.onLine) {
    const formData = await request.formData(); // Get the form data
    const cacheKey = generateCacheKey(request);

    // Cache the form data with the unique identifier
    const cache = await caches.open('form-data-cache');
    await cache.put(cacheKey, new Response(JSON.stringify(formData)));

    // Respond with a success response
    return new Response(JSON.stringify({ status: 'Cached' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    // Fetch the network response
    const networkResponse = await fetch(request.clone());
    // const clonedResponse = networkResponse.clone();
    // Network is online, proceed with the actual API call
    return fetch(networkResponse);
  }
}


async function syncFormData() {
  if (navigator.onLine) {
    const cache = await caches.open('form-data-cache');
    const keys = await cache.keys();

    for (const key of keys) {
      const cachedResponse = await cache.match(key);
      if (cachedResponse) {
        const formData = await cachedResponse.json();

        // Trigger the API call to save form data in the database
        await fetch('https://api.example.com/save-form-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        // Remove the cached form data after successful sync
        await cache.delete(key);
      }
    }
  }
}


async function handleGraphQlRequest(request) {
  const requestData = await request.json();
  console.log("Graphql request Data", requestData)
  if (requestData && requestData.operationType === 'mutation') {
    // Handle mutation
    return handleMutationRequest(request);
  } else {
    // Handle query
    return handleQueryRequest(request);
  }
} 

async function handleQueryRequest(request) {
  if (!navigator.onLine) {
    // Offline mode: Respond from cache if available, otherwise respond with an offline-friendly response
    const cache = await caches.open('graphql-cache');
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    } else {
      return new Response(JSON.stringify({ offline: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else {
    // Online mode: Fetch data from the network and update cache
    // try {
      const networkResponse = await fetch(request);
      const cache = await caches.open('graphql-cache');
      cache.put(request, networkResponse.clone());

      return networkResponse;
    // } catch (error) {
    //   console.error('Network request failed:', error);
    //   return new Response(JSON.stringify({ error: 'Network request failed' }), {
    //     status: 500,
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }
  }
}

async function handleMutationRequest(request) {
}