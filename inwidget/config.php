<?php

$CONFIG = array(

	// Instagram login
	'LOGIN' => 'belarusboss',

	// CLIEN_ID of Instagram application
	'CLIENT_ID' => '41422b0a7ac64d589430202cee4c0762',

	// Get pictures from WORLDWIDE by tag name. 
	// Use this options only if you want show pictures of other users. 
	// Important! Profile avatar and statistic will be hidden.
	'HASHTAG' => '#bossby',

	// Random order of pictures [ true / false ]
	'imgRandom' => true,

	// How many pictures widget will get from Instagram?
	'imgCount' => 30,

	// Cache expiration time (hours)
	'cacheExpiration' => 6,

	// Default language [ ru / en ] or something else from lang directory.
	'langDefault' => 'ru',

	// Language auto-detection [ true / false ]
	// This option may no effect if you set language by $_GET variable
	'langAuto' => false,

);