try {
	(function(){
		window.$vocalizer = {
			core: (function(window, document) {
				var request;
				var source;
				var timerStarted;
				var sourceArr = [];
				var audioCtx;
				var onError = function(message) {
					console.log(message);
				}

				function rawStringToBuffer(str) {
					var idx, len = str.length, arr = new ArrayBuffer(len);
					var uint8View = new Uint8Array(arr);
					for (idx = 0 ; idx < len ; ++idx) {
						uint8View[idx] = str.charCodeAt(idx) & 0xFF;
					}
					return new Int16Array(arr);
				};

				return {
					Init: function(onErrorCallback) {
						if ( ! onErrorCallback) {
							onError = onErrorCallback;
						}
						try {

							audioCtx = new (window.AudioContext || window.webkitAudioContext)();

							window.addEventListener('touchend', function() {
								var buffer = audioCtx.createBuffer(1, 1, 22050);
								var source = audioCtx.createBufferSource();

								source.buffer = buffer;
								source.connect(audioCtx.destination);
								if (source.start) 
									source.start(0);
								else if (source.noteOn) 
									source.noteOn(0);

							}, false);

							return true;

						}
						catch(e) {
							onError('Web Audio API is not supported in this browser');
						}

						return false;

					},
					SpeakParams: function (voice, language, voice_model, sample_rate) {
						this.language = language;
						this.voice = voice;
						this.sample_rate = sample_rate;
						this.voice_model = voice_model;
					},
					SpeakInput: function (data, content_type) {
						this.data = data;
						this.content_type = content_type;
					},
					SpeakUserDictionary: function (uri) {
						this.uri = uri;
					}, 

					SpeakTuenableData: function (uri, content_type) {
						this.uri = uri;
						this.content_type = content_type;
					},
					VoCSStop: function () {
						if (request && request.abort) {
							request.abort();
						}
						if (source && source.stop) {
							for (var i = 0; i < sourceArr.length; i++) {
								sourceArr[i].stop(0);
							}
						}
						if (timerStarted) {
							clearTimeout(endTimer);
						}
					},               
					VoCSGetCapabilities: function (hostname, onload, onError) {
						var request = new XMLHttpRequest();

						request.open('GET', hostname+'/vocs/caps');

						request.onload = function() {
							if (request.status != 200) {
								try{
									var data = JSON.parse(this.response);
									onError('Server returned: '+data.message);
								} catch(e) {
									onError('HTTP server returned: '+request.status);
									return;
								}
							}

							try{
								var data = JSON.parse(this.response);
								onload(data);
							} catch(e) {
								onError("Cannot parse server response");
							}
						}
						request.onerror = function() {
							onError('Capabilities request failed, VoCS server is down');
						}

						request.send();
					},
					VoCSSpeak: function (hostname, speak_params, speak_input, speak_user_dictionary, speak_tuneable_data, onCompleted, onError, save) {
						// Load buffer asynchronously
						request = new XMLHttpRequest();

						var body = '--message_boundary_0001\r\n'
						body += 'Content-Disposition: form-data; name="Parameters"\r\n'
						body += 'Content-Type: application/JSON; charset=utf-8\r\n'
						body += 'Content-Transfer-Encoding: 8bit\r\n'
						body +='\r\n'
						body +='{\r\n'
						body +='"session_id": "web-session-'+(Math.random() + 1).toString(36).substring(7)+'",\r\n'
						body +='"language": "'+speak_params.language+'",\r\n'
						body +='"voice": "'+speak_params.voice+'",\r\n'
						body +='"sample_rate": "'+speak_params.sample_rate+'",\r\n'
						body +='"voice_model": "'+speak_params.voice_model+'",\r\n'
						body +='"output_type": "0",\r\n'

						body +='"audio_chunk_duration_ms": "20000",\r\n'
						body +='"audio_chunk_notification": "1",\r\n'
						body +='"log_event": "1",\r\n'

						body +='"marker_mode": "7",\r\n'
						body +='"audio_info": "1"\r\n'
						body +='}\r\n'
						body +='--message_boundary_0001\r\n'
						body +='Content-Disposition: form-data; name="Input"\r\n'
						body +='Content-Type: application/JSON; charset=utf-8\r\n'
						body +='Content-Transfer-Encoding: 8bit\r\n'
						body += '\r\n'
						body += '{\r\n'
						body += '"data": '+JSON.stringify(speak_input.data)+',\r\n'
						body += '"content_type": '+JSON.stringify(speak_input.content_type)+',\r\n'
						body += '"content_encoding": "8bit"\r\n'
						body += '}\r\n'

						if (speak_user_dictionary && speak_user_dictionary.uri.length > 0) {
							var dict_array = speak_user_dictionary.uri.split(',');
							for (i in dict_array) {
								body += '--message_boundary_0001\r\n'
								body += 'Content-Disposition: form-data; name="UserDictionary"\r\n'
								body += 'Content-Type: application/json; charset=utf-8\r\n'
								body += 'Content-Transfer-Encoding: 8bit\r\n'
								body += '\r\n'
								body += '{\r\n'
								body += '"uri": '+JSON.stringify(dict_array[i])+',\r\n'
								body += '"content_type": "application/edct-bin-dictionary"\r\n'
								body += '}\r\n'
							}
						}
						if (speak_tuneable_data && speak_tuneable_data.uri.length > 0) {
							var tun_array = speak_tuneable_data.uri.split(',');
							for (i in tun_array) {
								body += '--message_boundary_0001\r\n'
								body += 'Content-Disposition: form-data; name="TuneableData"\r\n'
								body += 'Content-Type: application/json; charset=utf-8\r\n'
								body += 'Content-Transfer-Encoding: 8bit\r\n'
								body += '\r\n'
								body += '{\r\n'
								body += '"uri": '+JSON.stringify(tun_array[i])+',\r\n'
								body += '"content_type": '+JSON.stringify(speak_tuneable_data.content_type)+'\r\n'
								body += '}\r\n'
							}
						}
						body += '--message_boundary_0001--\r\n';

						if (!save) {
							request.open("POST", hostname+'/vocs/speak', true);
						}
						else {
							request.open("POST", hostname+'/vocs/speak?raw_pcm', true);
							request.responseType = "arraybuffer";
						}
						request.setRequestHeader("Content-type", "multipart/form-data; boundary=message_boundary_0001");
						request.overrideMimeType('text\/plain; charset=x-user-defined');

						var startTime;
						var totPlayLen = 0;
						var playTime = 0;
						var boundary = "";
						var processed = 0;

						sourceArr = [];
						timerStarted = 0;

						function ProcessPart() {

							/* make sure we process all the received parts */
							while(1) {
								//console.log("starting loop");

								/* if multipart boundary not set, extract it */
								if (boundary.length == 0) {
									contentType = request.getResponseHeader("Content-Type");
									if ((pos = contentType.indexOf("boundary=")) > 0) {
										boundary = contentType.substr(pos + 9);
									}
									else {
										boundary = request.responseText.match(/Nuance_VoCS_[0-9a-fA-F]+/);
									}
									if (boundary.length == 0) {
										console.log("cannot find the expected boundary");
										return;
									}
									console.log("boundary="+boundary);
								}

								if ((header_start_pos = request.responseText.indexOf(boundary, processed)) > 0) {

									if (request.responseText.substr(header_start_pos + boundary.length, 2) == "--") {
										console.log("Normal stream end found");
										return;
									} else {
										header_end_pos = request.responseText.indexOf("\r\n\r\n", processed);
										if (header_end_pos > 0) {
											header_end_pos += 4;
											part_header = request.responseText.substr(header_start_pos, header_end_pos - header_start_pos); 
											//console.log(part_header);
											next_start_pos = request.responseText.indexOf(boundary, header_end_pos);
											if (next_start_pos > 0) {
												part_body = request.responseText.substr(header_end_pos, next_start_pos - header_end_pos - 4);
												processed = next_start_pos;
												if (part_header.indexOf('name="Audio"') > 0 ) {
													console.log("Found audio part length:", part_body.length);
													/*console.log("Found audio part:", part_body);*/
													Play(part_body);
												} else if (part_header.indexOf('name="Event"') > 0) {
													try {
														var marker = JSON.parse(part_body); 
														console.log("Found "+marker.type+" marker position "+marker.inpos+" length "+marker.inlen);
													} catch(e) {
														onError('Cannot parse marker event');
													}
												} else if (part_header.indexOf('name="LogEvent"') > 0) {
													try{
														outstring = "EVENT ";
														myData = JSON.parse(part_body, function (key, value) {
															if (key && typeof key === 'string' && isNaN(key) && key != 'name' && key != 'values') {
																outstring += " ";
																outstring += key;
																outstring += ":";
															}
															if (value && typeof value === 'string') {
																outstring += value;
															}
															return value;
														});

														console.log(outstring);
													} catch(e) {
														onError('Cannot parse log event');
													}
												} else if (part_header.indexOf('name="Error"') > 0) {
													try {
														var data = JSON.parse(part_body);
														onError('Server returned: '+data.message);
														return;
													} catch(e) {
														onError('HTTP server returned error part');
														return;
													}
												} else {
													console.log("Received="+part_body);
												}
											} else {
												/* console.log("Cannot find end of header part, continuing ..."); */
												return;
											}
										} else {
											console.log("Cannot find end of first header part, continuing ...");
											return;
										}
									}
								} else {
									console.log("Cannot find boundary");
									return;
								}
							} /* while(1) */
						}

						function Play(text) {

							totPlayLen += text.length;

							var audioChunk = rawStringToBuffer(text);
							if (!audioChunk) {
								onError("Error: cannot create buffer");
								return;
							}

							if (!audioChunk.length) {
								return;
							}

							var audioBuffer = audioCtx.createBuffer(1, audioChunk.length, speak_params.sample_rate);
							if (!audioBuffer) {
								onError("Error: cannot create Web API audio buffer");
								return;
							}

							var floats = audioBuffer.getChannelData(0);

							for (i = 0; i < floats.length; i++) {
								floats[i] = audioChunk[i] / 32768;
							}

							// Get an AudioBufferSourceNode.
							// This is the AudioNode to use when we want to play an AudioBuffer
							source = audioCtx.createBufferSource();
							// set the buffer in the AudioBufferSourceNode
							source.buffer = audioBuffer;
							// connect the AudioBufferSourceNode to the
							// destination so we can hear the sound
							source.connect(audioCtx.destination);
							//keep track of audio sources to stop playback
							sourceArr.push(source);

							if (playTime == 0) {
								playTime = audioCtx.currentTime;
								startTime = audioCtx.currentTime;
							}

							if (playTime < audioCtx.currentTime) {
								playTime = audioCtx.currentTime;
							}

							// start the source playing
							if (source.start) 
								source.start(playTime);
							else if (source.noteOn) 
								source.noteOn(playTime);

							playTime += audioBuffer.duration;
						}

						function Error(str) {
							try{
								var data = JSON.parse(str);
								onError('Server returned: '+data.message);
							} catch(e) {
								onError('HTTP server returned: '+request.status);
							}
						}

						request.onreadystatechange = function() {

							if (!save && request.status == 200 && request.readyState == 3) {
								ProcessPart();
							}
						}

						request.onload = function() {

							if (save) {
								/* save to a file */
								if (request.status != 200) {
									Error(String.fromCharCode.apply(null, new Uint8Array(this.response)));
								}
								else {
										var audioChunk = new Int16Array(this.response);

										WavHeader = buildWaveHeader(new WavInfo(audioChunk.length, 1, speak_params.sample_rate, 2));

										var blob = new Blob([WavHeader,audioChunk], {type: "audio/x-wav"});

										saveAs(blob, speak_params.voice+'_'+speak_params.voice_model+'_'+speak_params.sample_rate+'.wav');

										onCompleted();
								}
							}
							else {
								/* use Web Audio API to play PCM */
								if (request.status != 200) {
									Error(this.response);
								}
								else {
									ProcessPart();

									console.log("Total audio duration:", playTime - startTime, "length:", totPlayLen);

									timerStarted = 1;
									endTimer = setTimeout(onCompleted, (playTime - audioCtx.currentTime) * 1000);
								}
							}
						}

						request.onerror = function() {
							onError("Cannot send SPEAK request");
						}

						request.send(body);
					}
				} // end of return 
			})(window, document),
			ux: (function(window, document, navigator){


				const input_type = "text/plain;charset=utf-8";
				const bit_rate = "28000";
				var is_safari = (navigator.userAgent.indexOf("Safari") > -1) && (navigator.userAgent.indexOf("Chrome") == -1);
				var id_btn_play = 'vocalizer_play';
				var id_progress = "vocalizer_progress";
				var id_voice = "vocalizer_voice";
				var id_input = "vocalizer_input";
				var id_error = "vocalizer_error";

				var hostname = "//127.0.0.1"; //window.location.origin; vocalizerplaygroundhost.nuance.com

				var onError = function (message) {
					var ele = document.getElementById(id_error);
					if ( !ele ) {
						console.log(message);
					} else {
						ele.innerHTML = message;
					}
				}

				function enable_play(enable) {
					var play = document.getElementById(id_btn_play);
					var progress = document.getElementById(id_progress);
					if (enable) {
						progress.innerHTML = "";
						play.innerHTML = 'Play';
					} else {
						play.innerHTML = 'Stop';
						progress.innerHTML = '<img src="/content/dam/nuance/third-party/enterprise/vocalizer/progress_circle.gif">';
					}
				}

				function on_speak_completed() {
					enable_play(true);
				}

				function on_speak_error(message) {
					enable_play(true);
					onError(message);
				}
				function createVoiceOption(cap) {
		            var el = document.createElement("option");
		            if (!(is_safari && cap.sample_rate == '8000')) {
		                el.label = '' + window.$vocalizer.utl.format('language', cap.language) + ': ' + window.$vocalizer.utl.format('voice', cap.voice) + ', ' + window.$vocalizer.utl.format('model', cap.voice_model) + ', ' + window.$vocalizer.utl.format('rate', cap.sample_rate) + (', ') + cap.version;
		                el.textContent = cap.voice + ', ' + cap.language + ', ' + cap.voice_model + ', ' + cap.sample_rate + ', ' + cap.version;
		                el.value = cap.voice;
		            }
		            return el;
				}

				return {
					setup: function(hostURL, btn_play, progress, voice, input, error) {
						
						hostname = hostURL ? hostURL : hostname;
						id_btn_play = btn_play ? btn_play : id_btn_play;
						id_progress = progress ? progress : id_progress;
						id_voice = voice ? voice : id_voice;
						id_input = input ? input : id_input;
						id_error = error ? error : id_error;


						if ( window.$vocalizer.core.Init(onError) == false) {
							onError("Cannot initialize browser audio!");
						}

						window.$vocalizer.core.VoCSGetCapabilities(hostname,
							function onload(caps) {

                				var map = new Object();
								for (i = 0; i < caps.capabilities.length; i++) {
									var cap = caps.capabilities[i];
	                				var key = window.$vocalizer.utl.format('language', cap.language);
	                    			var opt = createVoiceOption(cap);		

				                    if(map[key] === undefined) {
				                        map[key] = [opt];
				                    } else {
				                        opts = map[key];
				                        opts.push(opt);
				                        map[key] = opts;
				                    }
								}
				                var langs = Object.keys(map);
				                langs.sort();

								var el_voice = document.getElementById(id_voice);

				                for(i = 0; i < langs.length; i++) {
				                    opts = map[langs[i]];
				                    for(j = 0; j < opts.length; j++)
				                    {
				                        el_voice.appendChild(opts[j]);
				                    }
				                }
							}, 
							onError
						);
					},
					doSumit: function(dosave) {
						var generate_wav = false;

						if(dosave == 2) {
							dosave = 1;
							generate_wav = true;
						}

						var play = document.getElementById(id_btn_play);
						if (play.innerText === 'Stop') {
							window.$vocalizer.core.VoCSStop();
							enable_play(true);
							return;
						}
						var el_voice = document.getElementById(id_voice);
						el = el_voice.options[el_voice.selectedIndex];
						if (!el) {
							onError("Please select a voice!");
							return;
						}

						var params = el.text.split(", ");

						var input = document.getElementById(id_input);
						if (!input.value) {
							onError("Please enter input!");
							return;
						}

						var speak_params = new window.$vocalizer.core.SpeakParams(params[0], params[1], params[2], params[3], bit_rate, generate_wav);

						var speak_input = new window.$vocalizer.core.SpeakInput(input.value, input_type);

						window.$vocalizer.core.VoCSSpeak(hostname, speak_params, speak_input, null, null, on_speak_completed, on_speak_error, dosave);

						enable_play(false);
					}
				}
			})(window, document, navigator),  /* end of ux */
			utl: (function(){

				function formatLanguage(language){
					var formatted = '';
					if(language){
						var lang = '';
						switch (language.substring(0,2).toLowerCase()) {
							case 'ab': lang = 'Abkhazian'; break;
							case 'aa': lang = 'Afar'; break;
							case 'af': lang = 'Afrikaans'; break;
							case 'ak': lang = 'Akan'; break;
							case 'sq': lang = 'Albanian'; break;
							case 'am': lang = 'Amharic'; break;
							case 'ar': lang = 'Arabic'; break;
							case 'an': lang = 'Aragonese'; break;
							case 'hy': lang = 'Armenian'; break;
							case 'as': lang = 'Assamese'; break;
							case 'av': lang = 'Avaric'; break;
							case 'ae': lang = 'Avestan'; break;
							case 'ay': lang = 'Aymara'; break;
							case 'az': lang = 'Azerbaijani'; break;
							case 'bm': lang = 'Bambara'; break;
							case 'ba': lang = 'Bashkir'; break;
							case 'eu': lang = 'Basque'; break;
							case 'be': lang = 'Belarusian'; break;
							case 'bn': lang = 'Bengali'; break;
							case 'bh': lang = 'Bhojpuri'; break;
							case 'bi': lang = 'Bislama'; break;
							case 'bs': lang = 'Bosnian'; break;
							case 'br': lang = 'Breton'; break;
							case 'bg': lang = 'Bulgarian'; break;
							case 'my': lang = 'Burmese'; break;
							case 'ca': lang = 'Catalan'; break;
							case 'ch': lang = 'Chamorro'; break;
							case 'ce': lang = 'Chechen'; break;
							case 'ny': lang = 'Chichewa, Chewa, Nyanja'; break;
							case 'zh': lang = 'Mandarin'; break;
							case 'cv': lang = 'Chuvash'; break;
							case 'kw': lang = 'Cornish'; break;
							case 'co': lang = 'Corsican'; break;
							case 'cr': lang = 'Cree'; break;
							case 'hr': lang = 'Croatian'; break;
							case 'cs': lang = 'Czech'; break;
							case 'da': lang = 'Danish'; break;
							case 'dv': lang = 'Divehi, Dhivehi, Maldivian'; break;
							case 'nl': lang = 'Dutch, Flemish'; break;
							case 'dz': lang = 'Dzongkha'; break;
							case 'en': lang = 'English'; break;
							case 'eo': lang = 'Esperanto'; break;
							case 'et': lang = 'Estonian'; break;
							case 'ee': lang = 'Ewe'; break;
							case 'fo': lang = 'Faroese'; break;
							case 'fj': lang = 'Fijian'; break;
							case 'fi': lang = 'Finnish'; break;
							case 'fr': lang = 'French'; break;
							case 'ff': lang = 'Fulah'; break;
							case 'gl': lang = 'Galician'; break;
							case 'ka': lang = 'Georgian'; break;
							case 'de': lang = 'German'; break;
							case 'el': lang = 'Greek'; break;
							case 'gn': lang = 'GuaranÃ­'; break;
							case 'gu': lang = 'Gujarati'; break;
							case 'ht': lang = 'Haitian, Haitian Creole'; break;
							case 'ha': lang = 'Hausa'; break;
							case 'he': lang = 'Hebrew'; break;
							case 'hz': lang = 'Herero'; break;
							case 'hi': lang = 'Hindi'; break;
							case 'ho': lang = 'Hiri Motu'; break;
							case 'hu': lang = 'Hungarian'; break;
							case 'ia': lang = 'Interlingua'; break;
							case 'id': lang = 'Indonesian'; break;
							case 'ie': lang = 'Interlingue'; break;
							case 'ga': lang = 'Irish'; break;
							case 'ig': lang = 'Igbo'; break;
							case 'ik': lang = 'Inupiaq'; break;
							case 'io': lang = 'Ido'; break;
							case 'is': lang = 'Icelandic'; break;
							case 'it': lang = 'Italian'; break;
							case 'iu': lang = 'Inuktitut'; break;
							case 'ja': lang = 'Japanese'; break;
							case 'jv': lang = 'Javanese'; break;
							case 'kl': lang = 'Kalaallisut, Greenlandic'; break;
							case 'kn': lang = 'Kannada'; break;
							case 'kr': lang = 'Kanuri'; break;
							case 'ks': lang = 'Kashmiri'; break;
							case 'kk': lang = 'Kazakh'; break;
							case 'km': lang = 'Central Khmer'; break;
							case 'ki': lang = 'Kikuyu, Gikuyu'; break;
							case 'rw': lang = 'Kinyarwanda'; break;
							case 'ky': lang = 'Kirghiz, Kyrgyz'; break;
							case 'kv': lang = 'Komi'; break;
							case 'kg': lang = 'Kongo'; break;
							case 'ko': lang = 'Korean'; break;
							case 'ku': lang = 'Kurdish'; break;
							case 'kj': lang = 'Kuanyama, Kwanyama'; break;
							case 'la': lang = 'Latin'; break;
							case 'lb': lang = 'Luxembourgish, Letzeburgesch'; break;
							case 'lg': lang = 'Ganda'; break;
							case 'li': lang = 'Limburgan, Limburger, Limburgish'; break;
							case 'ln': lang = 'Lingala'; break;
							case 'lo': lang = 'Lao'; break;
							case 'lt': lang = 'Lithuanian'; break;
							case 'lu': lang = 'Luba-Katanga'; break;
							case 'lv': lang = 'Latvian'; break;
							case 'gv': lang = 'Manx'; break;
							case 'mk': lang = 'Macedonian'; break;
							case 'mg': lang = 'Malagasy'; break;
							case 'ms': lang = 'Malay'; break;
							case 'ml': lang = 'Malayalam'; break;
							case 'mt': lang = 'Maltese'; break;
							case 'mi': lang = 'Maori'; break;
							case 'mr': lang = 'Marathi'; break;
							case 'mh': lang = 'Marshallese'; break;
							case 'mn': lang = 'Mongolian'; break;
							case 'na': lang = 'Nauru'; break;
							case 'nv': lang = 'Navajo, Navaho'; break;
							case 'nd': lang = 'North Ndebele'; break;
							case 'ne': lang = 'Nepali'; break;
							case 'ng': lang = 'Ndonga'; break;
							case 'nb': lang = 'Norwegian BokmÃ¥l'; break;
							case 'nn': lang = 'Norwegian Nynorsk'; break;
							case 'no': lang = 'Norwegian'; break;
							case 'ii': lang = 'Sichuan Yi, Nuosu'; break;
							case 'nr': lang = 'South Ndebele'; break;
							case 'oc': lang = 'Occitan'; break;
							case 'oj': lang = 'Ojibwa'; break;
							case 'cu': lang = 'ChurchÂ Slavic, ChurchÂ Slavonic,Â OldÂ ChurchÂ Slavonic, OldÂ Slavonic,Â OldÂ Bulgarian'; break;
							case 'om': lang = 'Oromo'; break;
							case 'or': lang = 'Oriya'; break;
							case 'os': lang = 'Ossetian, Ossetic'; break;
							case 'pa': lang = 'Panjabi, Punjabi'; break;
							case 'pi': lang = 'Pali'; break;
							case 'fa': lang = 'Persian'; break;
							case 'pl': lang = 'Polish'; break;
							case 'ps': lang = 'Pashto, Pushto'; break;
							case 'pt': lang = 'Portuguese'; break;
							case 'qu': lang = 'Quechua'; break;
							case 'rm': lang = 'Romansh'; break;
							case 'rn': lang = 'Rundi'; break;
							case 'ro': lang = 'Romanian'; break;
							case 'ru': lang = 'Russian'; break;
							case 'sa': lang = 'Sanskrit'; break;
							case 'sc': lang = 'Sardinian'; break;
							case 'sd': lang = 'Sindhi'; break;
							case 'se': lang = 'Northern Sami'; break;
							case 'sm': lang = 'Samoan'; break;
							case 'sg': lang = 'Sango'; break;
							case 'sr': lang = 'Serbian'; break;
							case 'gd': lang = 'Gaelic, Scottish Gaelic'; break;
							case 'sn': lang = 'Shona'; break;
							case 'si': lang = 'Sinhala, Sinhalese'; break;
							case 'sk': lang = 'Slovak'; break;
							case 'sl': lang = 'Slovenian'; break;
							case 'so': lang = 'Somali'; break;
							case 'st': lang = 'Southern Sotho'; break;
							case 'es': lang = 'Spanish, Castilian'; break;
							case 'su': lang = 'Sundanese'; break;
							case 'sw': lang = 'Swahili'; break;
							case 'ss': lang = 'Swati'; break;
							case 'sv': lang = 'Swedish'; break;
							case 'sz': lang = 'Sichuanese'; break;
							case 'ta': lang = 'Tamil'; break;
							case 'te': lang = 'Telugu'; break;
							case 'tg': lang = 'Tajik'; break;
							case 'th': lang = 'Thai'; break;
							case 'ti': lang = 'Tigrinya'; break;
							case 'bo': lang = 'Tibetan'; break;
							case 'tk': lang = 'Turkmen'; break;
							case 'tl': lang = 'Tagalog'; break;
							case 'tn': lang = 'Tswana'; break;
							case 'to': lang = 'TongaÂ (Tonga Islands)'; break;
							case 'tr': lang = 'Turkish'; break;
							case 'ts': lang = 'Tsonga'; break;
							case 'tt': lang = 'Tatar'; break;
							case 'tw': lang = 'Twi'; break;
							case 'ty': lang = 'Tahitian'; break;
							case 'ug': lang = 'Uighur, Uyghur'; break;
							case 'uk': lang = 'Ukrainian'; break;
							case 'ur': lang = 'Urdu'; break;
							case 'uz': lang = 'Uzbek'; break;
							case 've': lang = 'Venda'; break;
							case 'va': lang = 'Valencian'; break;
							case 'vi': lang = 'Vietnamese'; break;
							case 'vo': lang = 'VolapÃ¼k'; break;
							case 'wa': lang = 'Walloon'; break;
							case 'cy': lang = 'Welsh'; break;
							case 'wo': lang = 'Wolof'; break;
							case 'fy': lang = 'Western Frisian'; break;
							case 'xh': lang = 'Xhosa'; break;
							case 'yi': lang = 'Yiddish'; break;
							case 'yo': lang = 'Yoruba'; break;
							case 'za': lang = 'Zhuang, Chuang'; break;
							case 'zu': lang = 'Zulu'; break;
							default: lang  = language.substring(0,2); break;
						}

						switch(language.toLowerCase()) {
							case 'zh-hk': lang = 'Cantonese'; break;
						}
						formatted  += lang + ' (';

						var country = '';
						switch (language.substring(3, language.length).toLowerCase()){
							case 'af': country = 'Afghanistan'; break;
							case 'al': country = 'Albania'; break;
							case 'dz': country = 'Algeria'; break;
							case 'as': country = 'American Samoa'; break;
							case 'ad': country = 'Andorra'; break;
							case 'ao': country = 'Angola'; break;
							case 'ai': country = 'Anguilla'; break;
							case 'aq': country = 'Antarctica'; break;
							case 'ag': country = 'Antigua and Barbuda'; break;
							case 'ar': country = 'Argentina'; break;
							case 'am': country = 'Armenia'; break;
							case 'aw': country = 'Aruba'; break;
							case 'au': country = 'Australia'; break;
							case 'at': country = 'Austria'; break;
							case 'az': country = 'Azerbaijan'; break;
							case 'bs': country = 'Bahamas'; break;
							case 'bh': country = 'Bahrain'; break;
							case 'bd': country = 'Bangladesh'; break;
							case 'bb': country = 'Barbados'; break;
							case 'by': country = 'Belarus'; break;
							case 'be': country = 'Belgium'; break;
							case 'bz': country = 'Belize'; break;
							case 'bj': country = 'Benin'; break;
							case 'bm': country = 'Bermuda'; break;
							case 'bt': country = 'Bhutan'; break;
							case 'bo': country = 'Bolivia'; break;
							case 'bq': country = 'Bonaire'; break;
							case 'ba': country = 'Bosnia and Herzegovina'; break;
							case 'bw': country = 'Botswana'; break;
							case 'bv': country = 'Bouvet Island'; break;
							case 'br': country = 'Brazil'; break;
							case 'io': country = 'British Indian Ocean Territory'; break;
							case 'bn': country = 'Brunei Darussalam'; break;
							case 'bg': country = 'Bulgaria'; break;
							case 'bf': country = 'Burkina Faso'; break;
							case 'bi': country = 'Burundi'; break;
							case 'kh': country = 'Cambodia'; break;
							case 'cm': country = 'Cameroon'; break;
							case 'ca': country = 'Canada'; break;
							case 'cv': country = 'Cape Verde'; break;
							case 'ky': country = 'Cayman Islands'; break;
							case 'cf': country = 'Central African Republic'; break;
							case 'td': country = 'Chad'; break;
							case 'cl': country = 'Chile'; break;
							case 'cn': country = 'China'; break;
							case 'cx': country = 'Christmas Island'; break;
							case 'cc': country = 'Cocos (Keeling) Islands'; break;
							case 'co': country = 'Colombia'; break;
							case 'km': country = 'Comoros'; break;
							case 'cg': country = 'Congo'; break;
							case 'cd': country = 'Democratic Republic of the Congo'; break;
							case 'ck': country = 'Cook Islands'; break;
							case 'cr': country = 'Costa Rica'; break;
							case 'hr': country = 'Croatia'; break;
							case 'cu': country = 'Cuba'; break;
							case 'cw': country = 'Curacao'; break;
							case 'cy': country = 'Cyprus'; break;
							case 'cz': country = 'Czech Republic'; break;
							case 'ci': country = 'Cote d\'Ivoire'; break;
							case 'dk': country = 'Denmark'; break;
							case 'dj': country = 'Djibouti'; break;
							case 'dm': country = 'Dominica'; break;
							case 'do': country = 'Dominican Republic'; break;
							case 'ec': country = 'Ecuador'; break;
							case 'eg': country = 'Egypt'; break;
							case 'sv': country = 'El Salvador'; break;
							case 'gq': country = 'Equatorial Guinea'; break;
							case 'er': country = 'Eritrea'; break;
							case 'ee': country = 'Estonia'; break;
							case 'et': country = 'Ethiopia'; break;
							case 'fk': country = 'Falkland Islands (Malvinas)'; break;
							case 'fo': country = 'Faroe Islands'; break;
							case 'fj': country = 'Fiji'; break;
							case 'fi': country = 'Finland'; break;
							case 'fr': country = 'France'; break;
							case 'gf': country = 'French Guiana'; break;
							case 'pf': country = 'French Polynesia'; break;
							case 'tf': country = 'French Southern Territories'; break;
							case 'ga': country = 'Gabon'; break;
							case 'gm': country = 'Gambia'; break;
							case 'ge': country = 'Georgia'; break;
							case 'de': country = 'Germany'; break;
							case 'gh': country = 'Ghana'; break;
							case 'gi': country = 'Gibraltar'; break;
							case 'gb': country = 'Great Britain'; break;
							case 'gr': country = 'Greece'; break;
							case 'gl': country = 'Greenland'; break;
							case 'gd': country = 'Grenada'; break;
							case 'gp': country = 'Guadeloupe'; break;
							case 'gu': country = 'Guam'; break;
							case 'gt': country = 'Guatemala'; break;
							case 'gg': country = 'Guernsey'; break;
							case 'gn': country = 'Guinea'; break;
							case 'gw': country = 'Guinea-Bissau'; break;
							case 'gy': country = 'Guyana'; break;
							case 'ht': country = 'Haiti'; break;
							case 'hm': country = 'Heard Island and McDonald Mcdonald Islands'; break;
							case 'va': country = 'Holy See (Vatican City State)'; break;
							case 'hn': country = 'Honduras'; break;
							case 'hk': country = 'Hong Kong'; break;
							case 'hu': country = 'Hungary'; break;
							//case 'is': country = 'Iceland'; break;
							case 'is': country = 'Israel'; break;
							case 'in': country = 'India'; break;
							case '-in': country = 'India'; break;
							case 'id': country = 'Indonesia'; break;
							case 'ir': country = 'Islamic Republic of Iran'; break;
							case 'iq': country = 'Iraq'; break;
							case 'ie': country = 'Ireland'; break;
							case 'im': country = 'Isle of Man'; break;
							case 'il': country = 'Israel'; break;
							case 'it': country = 'Italy'; break;
							case 'jm': country = 'Jamaica'; break;
							case 'jp': country = 'Japan'; break;
							case 'je': country = 'Jersey'; break;
							case 'jo': country = 'Jordan'; break;
							case 'kz': country = 'Kazakhstan'; break;
							case 'ke': country = 'Kenya'; break;
							case 'ki': country = 'Kiribati'; break;
							case 'kp': country = 'Democratic People\'s Republic of Korea'; break;
							case 'kr': country = 'Republic of Korea'; break;
							case 'kw': country = 'Kuwait'; break;
							case 'kg': country = 'Kyrgyzstan'; break;
							case 'la': country = 'Lao People\'s Democratic Republic'; break;
							case 'lv': country = 'Latvia'; break;
							case 'lb': country = 'Lebanon'; break;
							case 'ls': country = 'Lesotho'; break;
							case 'lr': country = 'Liberia'; break;
							case 'ly': country = 'Libya'; break;
							case 'li': country = 'Liechtenstein'; break;
							case 'lt': country = 'Lithuania'; break;
							case 'lu': country = 'Luxembourg'; break;
							case 'mo': country = 'Macao'; break;
							case 'mk': country = 'Macedonia, the Former Yugoslav Republic of'; break;
							case 'mg': country = 'Madagascar'; break;
							case 'mw': country = 'Malawi'; break;
							case 'my': country = 'Malaysia'; break;
							case 'mv': country = 'Maldives'; break;
							case 'ml': country = 'Mali'; break;
							case 'mt': country = 'Malta'; break;
							case 'mh': country = 'Marshall Islands'; break;
							case 'mq': country = 'Martinique'; break;
							case 'mr': country = 'Mauritania'; break;
							case 'mu': country = 'Mauritius'; break;
							case 'yt': country = 'Mayotte'; break;
							case 'mx': country = 'Mexico'; break;
							case 'fm': country = 'Micronesia, Federated States of'; break;
							case 'md': country = 'Moldova, Republic of'; break;
							case 'mc': country = 'Monaco'; break;
							case 'mn': country = 'Mongolia'; break;
							case 'me': country = 'Montenegro'; break;
							case 'ms': country = 'Malaysia'; break;
							case 'ma': country = 'Morocco'; break;
							case 'mz': country = 'Mozambique'; break;
							case 'mm': country = 'Myanmar'; break;
							case 'na': country = 'Namibia'; break;
							case 'nr': country = 'Nauru'; break;
							case 'np': country = 'Nepal'; break;
							case 'nl': country = 'Netherlands'; break;
							case 'nc': country = 'New Caledonia'; break;
							case 'nz': country = 'New Zealand'; break;
							case 'ni': country = 'Nicaragua'; break;
							case 'ne': country = 'Niger'; break;
							case 'ng': country = 'Nigeria'; break;
							case 'nu': country = 'Niue'; break;
							case 'nf': country = 'Norfolk Island'; break;
							case 'mp': country = 'Northern Mariana Islands'; break;
							case 'no': country = 'Norway'; break;
							case 'om': country = 'Oman'; break;
							case 'pk': country = 'Pakistan'; break;
							case 'pw': country = 'Palau'; break;
							case 'ps': country = 'Palestine, State of'; break;
							case 'pa': country = 'Panama'; break;
							case 'pg': country = 'Papua New Guinea'; break;
							case 'py': country = 'Paraguay'; break;
							case 'pe': country = 'Peru'; break;
							case 'ph': country = 'Philippines'; break;
							case 'pn': country = 'Pitcairn'; break;
							case 'pl': country = 'Poland'; break;
							case 'pt': country = 'Portugal'; break;
							case 'pr': country = 'Puerto Rico'; break;
							case 'qa': country = 'Qatar'; break;
							case 'ro': country = 'Romania'; break;
							case 'ru': country = 'Russian Federation'; break;
							case 'rw': country = 'Rwanda'; break;
							case 're': country = 'Reunion'; break;
							case 'bl': country = 'Saint Barthelemy'; break;
							case 'sh': country = 'Saint Helena'; break;
							case 'kn': country = 'Saint Kitts and Nevis'; break;
							case 'lc': country = 'Saint Lucia'; break;
							case 'mf': country = 'Saint Martin (French part)'; break;
							case 'pm': country = 'Saint Pierre and Miquelon'; break;
							case 'vc': country = 'Saint Vincent and the Grenadines'; break;
							case 'ws': country = 'Samoa'; break;
							case 'sm': country = 'San Marino'; break;
							case 'st': country = 'Sao Tome and Principe'; break;
							case 'sa': country = 'Saudi Arabia'; break;
							case 'sn': country = 'Senegal'; break;
							case 'rs': country = 'Serbia'; break;
							case 'sc': country = 'Scotland'; break;
							case 'sl': country = 'Sierra Leone'; break;
							case 'sg': country = 'Singapore'; break;
							case 'sx': country = 'Sint Maarten (Dutch part)'; break;
							case 'sk': country = 'Slovakia'; break;
							case 'si': country = 'Slovenia'; break;
							case 'sb': country = 'Solomon Islands'; break;
							case 'so': country = 'Somalia'; break;
							case 'za': country = 'South Africa'; break;
							case 'gs': country = 'South Georgia and the South Sandwich Islands'; break;
							case 'ss': country = 'South Sudan'; break;
							case 'es': country = 'Spain'; break;
							case 'lk': country = 'Sri Lanka'; break;
							case 'sd': country = 'Sudan'; break;
							case 'sr': country = 'Suriname'; break;
							case 'sj': country = 'Svalbard and Jan Mayen'; break;
							case 'sz': country = 'Swaziland'; break;
							case 'se': country = 'Sweden'; break;
							case 'ch': country = 'Switzerland'; break;
							case 'sy': country = 'Syrian Arab Republic'; break;
							case 'tw': country = 'Taiwan'; break;
							case 'tj': country = 'Tajikistan'; break;
							case 'tz': country = 'United Republic of Tanzania'; break;
							case 'th': country = 'Thailand'; break;
							case 'tl': country = 'Timor-Leste'; break;
							case 'tg': country = 'Togo'; break;
							case 'tk': country = 'Tokelau'; break;
							case 'to': country = 'Tonga'; break;
							case 'tt': country = 'Trinidad and Tobago'; break;
							case 'tn': country = 'Tunisia'; break;
							case 'tr': country = 'Turkey'; break;
							case 'tm': country = 'Turkmenistan'; break;
							case 'tc': country = 'Turks and Caicos Islands'; break;
							case 'tv': country = 'Tuvalu'; break;
							case 'ug': country = 'Uganda'; break;
							case 'ua': country = 'Ukraine'; break;
							case 'ae': country = 'United Arab Emirates'; break;
							case 'gb': country = 'United Kingdom'; break;
							case 'us': country = 'United States'; break;
							case 'um': country = 'United States Minor Outlying Islands'; break;
							case 'uy': country = 'Uruguay'; break;
							case 'uz': country = 'Uzbekistan'; break;
							case 'vu': country = 'Vanuatu'; break;
							case 've': country = 'Venezuela'; break;
							case 'vn': country = 'Viet Nam'; break;
							case 'vg': country = 'British Virgin Islands'; break;
							case 'vi': country = 'US Virgin Islands'; break;
							case 'wf': country = 'Wallis and Futuna'; break;
							case 'ww': country = 'Worldwide'; break;
							case 'eh': country = 'Western Sahara'; break;
							case 'ye': country = 'Yemen'; break;
							case 'zm': country = 'Zambia'; break;
							case 'zw': country = 'Zimbabwe'; break;
							default: country  = language.substring(3, language.length); break;
						}



						formatted  += country + ')';
					}
					return formatted;
				}

				function formatName(name){
					var formatted = '';
					for(var j = 0; j < name.length; j++){
						if(name.substring(j,j+5).toLowerCase() === '-mlsc'){ // -mlsc extension
							formatted  += ' (multi-lingual, conversational)';
							j = j+5;
						}
				    else if(name.substring(j,j+5).toLowerCase() === '-mls'){ // -mls extension
				    	formatted  += ' (multi-lingual, multi-style)';
				    	j = j+5;
				    }
						else if(name.substring(j,j+4).toLowerCase() === '-enu' || name.substring(j,j+4).toLowerCase() === '-mnt' ){ // -enu extension (e.g.: asus-enu = already in enu language group so no skilltag required);
							j = j+4;
						}
						else if(name.substring(j,j+3).toLowerCase() === '-ml'){ // -ml extension (e.g.: Ava-Ml)
							formatted  += ' (multi-lingual)';
							j = j+3;
						}
						else if(name.substring(j,j+3).toLowerCase() === '-ms'){ // -ms extension (e.g.: Ava-Ms)
							formatted  += ' (multi-style)';
							j = j+3;
						}
						else if(name.substring(j,j+3).toLowerCase() === '-sc'){
							formatted  += ' (conversational)';
							j = j+3;
						}
						else { // no extension (e.g.: Ava, Li-Li, Ina, ...
							var letter = name.charAt(j);
							formatted  += letter;
						}
					}
					return formatted;
				}

				function formatModel(model){
					var formatted = '';
					if(/*opt.voice_helpel*/ model){
						switch (/*opt.voice_helpel*/ model.substring(0,4)){
							case 'bet4': formatted += 'bet4'; break;
							case 'full': formatted  += 'bet1'; break;
							default: formatted  += /*opt.voice_helpel*/ model; break;
						}
					}
					return formatted;
				}

				function formatRate(rate){
					return rate + " Hz";
				}

				return {
					format : function(select, input){
						switch (select){
							case 'language': return formatLanguage(input); break;
							case 'voice': return formatName(input); break;
							case 'model': return formatModel(input); break;
							case 'rate': return formatRate(input); break;
							case 'version': return input; break;
						}
					}
				}

			})()  /* end of util*/
		} /* core object end */
	})();
} catch(e) { console.log(" Error throwed:" + e)}
