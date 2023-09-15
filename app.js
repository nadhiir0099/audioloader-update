// npm run dev "this will start the server"

//required packages
const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

//create the express server
const app = express();

//server port number
const PORT =5000;

//insert template engine
app.set("view engine", "ejs");
app.use(express.static("public"));

//needed to parse html data for POST request
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json());

app.get("/",(req,res) =>{
    res.render("index", { active: "playlist" });
})

app.post("/convert-mp3", async (req,res) => {
    const inputLink = req.body.videoID;
    let videoId ="";
    let equals = inputLink.indexOf("=")
    let slash = inputLink.lastIndexOf("/")
    if(inputLink.length===28){
        videoId+=inputLink.substring(slash+1,inputLink.length)
    }else if(inputLink.length===43) {
        videoId+=inputLink.substring(equals+1,inputLink.length)
    }else if(inputLink.lastIndexOf("&")===43) {
        videoId+=inputLink.substring(equals+1,inputLink.lastIndexOf("&"))
    }else if(inputLink.indexOf("?")===28){
        videoId+=inputLink.substring(slash+1,inputLink.indexOf("?"))
    }else{
        videoId+=inputLink
    }
    console.log(`id: ${videoId}`)
    if(!videoId){
        return res.render("index", {success : false, message : "Please insert a video ID"});
    }else{
        const fetchAPI = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`, {
            method: "GET",
            headers: {
                "x-rapidapi-key" : process.env.API_KEY,
                "x-rapidapi-host" : "youtube-mp36.p.rapidapi.com"
            }
        });
        const fetchResponse = await fetchAPI.json();
        const Emsg = "AudioLoader is still in beta and it has a limited number of requests... \nPlease come back later."
        if(fetchResponse.status === "ok")
            return res.render("index",{success : true, song_title : fetchResponse.title, song_link : fetchResponse.link});
        else
            return res.render("index", {success : false, message : fetchResponse.msg || Emsg})
    }
})

app.post("/convert-playlist", async(req,res)=>{
    const playlistLink = req.body.PlaylistID
    let playlistID = new URLSearchParams(playlistLink.slice(playlistLink.indexOf("?")))
    playlistID = playlistID.get("list")
    console.log(playlistID)
    const fetchPlaylist = await fetch(`https://yt-api.p.rapidapi.com/playlist?id=${playlistID}`,{
        method: "GET",
        headers: {
            "x-rapidapi-key" : "226cd563bdmsh1efe3238d8c8434p17f4b4jsn2f4ff61fae60",
            "x-rapidapi-host" : 'yt-api.p.rapidapi.com'
        }
    })
    const fetchResPl = await fetchPlaylist.json();
    const Emsg = "AudioLoader is still in beta and it has a limited number of requests... \nPlease come back later."
    if(fetchResPl.meta && fetchResPl.data){
        let downloadLinks = {};
        let thumbnails = {};
        for(var vid of fetchResPl.data) {
            thumbnails[vid.videoId] = vid.thumbnail[vid.thumbnail.length-1].url;
            let fetchVid = await fetch(`https://youtube-mp36.p.rapidapi.com/dl?id=${vid.videoId}`, {
                method: "GET",
                headers: {
                    "x-rapidapi-key" : process.env.API_KEY,
                    "x-rapidapi-host" : 'youtube-mp36.p.rapidapi.com'
                }
            });
            fetchVid = await fetchVid.json();
            if(fetchVid.status == "ok") {
                downloadLinks[vid.videoId] = fetchVid.link;
            }
        }
        fetchResPl.downloadLinks = downloadLinks;
        fetchResPl.thumbnails = thumbnails;
        console.log(thumbnails);
        return res.render("index",{plsuccess: true, playlist: fetchResPl });
    } else {
        return res.render("index", {plsuccess: false, message: fetchResPl.msg || Emsg });
    }
})

// start the server
app.listen(PORT, ()=>{
    console.log(`server started on port ${PORT}`);
});

