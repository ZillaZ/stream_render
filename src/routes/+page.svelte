<script lang="ts">
 import { page } from "$app/state";
 import Hls from "hls.js";

 const params = page.url.searchParams
 const raw_url = params.get("url")
 const src = raw_url ? decodeURI(raw_url) : null
 const hls = new Hls()
 hls.on(Hls.Events.ERROR, e => {
     console.error(e)
 })

 let video_component : HTMLVideoElement | undefined = $state()

 let video_url = $derived.by(async () => {
     if(!raw_url || !src) return ""
     let url = `http://localhost:5173/api/stream?protocol=m3u8&video=${encodeURIComponent(raw_url)}`
     if (Hls.isSupported() && video_component) {
         hls.loadSource(url);
         hls.attachMedia(video_component);
     } else if (video_component?.canPlayType("application/vnd.apple.mpegurl")) {
         video_component.src = url;
     }
     return url
 })
 $inspect(video_url)
</script>

{#if src}
    <video
        id="my-video"
        class="video-js"
        controls
        preload="auto"
        width="640"
        height="264"
        bind:this={video_component}
    >
    </video>
{/if}
