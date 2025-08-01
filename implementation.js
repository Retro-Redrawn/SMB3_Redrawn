/*
*   Retro Redrawn 
*   -- Implementation Script
*
*   Frontend data container of the Redrawn Viewer. 
*   Contains implementation data specific to a Redrawn project.
*
*   Author: Tyson Moll (vvvvvvv)
*
*   Created in 2023
*/

// Directories
const CANVAS_BACKGROUND_IMAGE = 'img/website/grid_mario.png'; // Tiled background image for the canvas (blank if none)
const WINDOW_BACKGROUND_COLOR = 0x000000;    // Color for the window background
const WINDOW_BACKGROUND_IMAGE = ''; // Tiled background image for the window (blank if none)

// File Naming
const NEW_SLICE_SUFFIX = '' // Optional suffix added to new map file names (e.g. '_new' for 'map_name_new.png')
const OLD_SLICE_SUFFIX = '' // Optional suffix added to old map file names (e.g. '_old' for 'map_name_old.png')

// Audio
var bgmTrack = 'audio/overworld.mp3';

/** Content layers in the Redrawn */
var activeLayerIndex = 0;           // Currently active layer index (and initial index)
var redrawnLayers = [
    {
        name: "game", // name of folder containing screens for a layer
        canvasSize: {width: 3960, height: 4900},
        areas: marioAreas
    }
];

/** Biome Data (Screen icons) 
 * (to be updated per the organizer's tastes)
 * 
 * see icon list here >> https://fonts.google.com/icons
*/
var biomes = [
    {
        name: "World",
        ident: "world",
        iconId: "language",
        color: 'rgb(15 15 15)',
    },
    {
        name: "Grass",
        ident: "grass",
        iconId: "grass",
        color: 'rgb(20 80 160)',
    },
	{
        name: "Desert",
        ident: "desert",
        iconId: "landscape",
        color: 'rgb(20 80 160)',
    },
	{
        name: "Water",
        ident: "water",
        iconId: "water",
        color: 'rgb(20 80 160)',
    },
	{
        name: "Giant",
        ident: "giant",
        iconId: "arrow_upward",
        color: 'rgb(20 80 160)',
    },
	{
        name: "Sky",
        ident: "sky",
        iconId: "cloud",
        color: 'rgb(20 80 160)',
    },
	{
        name: "Ice",
        ident: "ice",
        iconId: "ac_unit",
        color: 'rgb(20 80 160)',
    },
	{
		name: "Pipe",
        ident: "pipe",
        iconId: "plumbing",
        color: 'rgb(20 80 160)',
    },
	{
		name: "Dark",
        ident: "dark",
        iconId: "dark_mode",
        color: 'rgb(20 80 160)',
    },
	{
		name: "Bonus",
        ident: "bonus",
        iconId: "star",
        color: 'rgb(20 80 160)',
    },
	{
		name: "Boss",
        ident: "boss",
        iconId: "brightness_alert",
        color: 'rgb(20 80 160)',
    },
];
