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
/**
 * File path to tiled background image for the canvas (use empty string if none)
 * @type {string}
 */
const CANVAS_BACKGROUND_IMAGE = 'img/website/grid_mario.png';
/**
 * Hex Color for the window background.
 * @type {int}
 */
const WINDOW_BACKGROUND_COLOR = 0x000000;
/**
 * File path to tiled background image for the window (blank if none)
 * @type {string}
 */
const WINDOW_BACKGROUND_IMAGE = '';

// File Naming
/** 
 * Optional suffix added to new map file names (e.g. '_new' for 'map_name_new.png') 
 * @type {string}
 */
const NEW_SLICE_SUFFIX = '';

/** 
 * Optional suffix added to old map file names (e.g. '_old' for 'map_name_old.png')
 * @type {string}
 */
const OLD_SLICE_SUFFIX = '';

// Layers
/**
 * Currently active layer index (and initial index) 
 * @type {int}
 */
var activeLayerIndex = 0;

/** 
 * Content layers in the Redrawn 
 * @type {Array<{name: string, canvasSize:{width: int, height: int}, areas: string}>}
 */
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
        iconId: "accessibility_new",
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
];

/** 
 * Directory of image files tied to defined iconIds. 
 * If not defined here, the icon is looked up in the Material Icon library. 
 * Ideal dimensions are 24x24px; image will automatically be resized.
 * @type {Array<{iconId: string, path: string}>}
 */
var iconFiles = [
];
