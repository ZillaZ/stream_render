<script lang="ts">
 import { page } from '$app/state';
 import Hls from 'hls.js';

 const raw_url = page.url.searchParams.get('url');

 const video_source_url = raw_url
                        ? `/api/stream?video=${encodeURIComponent(raw_url)}`
                        : null;

 const hls = new Hls();
 hls.on(Hls.Events.ERROR, (event, data) => {
     if (data.fatal) {
         console.error('HLS Fatal Error:', data);
     } else {
         console.warn('HLS Non-Fatal Error:', data);
     }
 });

 let video_component: HTMLVideoElement | undefined = $state();

 $effect(() => {
     if (video_source_url && video_component && Hls.isSupported()) {
         console.log('Attaching HLS source:', video_source_url);
         hls.loadSource(video_source_url);
         hls.attachMedia(video_component);
     }
 });
</script>

{#if video_source_url}
    <video
        id="my-video"
        class="video-js"
        controls
        preload="auto"
        width="640"
        height="264"
        bind:this={video_component}
    >
        <source src={video_source_url} type="application/vnd.apple.mpegurl" />
    </video>
{:else}
    <p>No video URL provided.</p>
{/if}
