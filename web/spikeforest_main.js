/*
 * Copyright 2016-2017 Flatiron Institute, Simons Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function jsqmain(query) {

    // The url query
    query=query||{};

    // Determine whether we are running on localhost (development mode)
    var on_localhost=jsu_starts_with(window.location.href,'http://localhost');

    // Switch to https protocol if needed
    if ((!on_localhost)&&(location.protocol != 'https:')) {
        location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
    }

    show_full_browser_message('Spike Forest','Loading config...');

    load_config(query.config_id,function(err,config) {
        if (err) {
            show_full_browser_message('Spike Forest','Error loading config: '+err);
            return;
        }
        console.log ('Config:');
        console.log (config);
        show_full_browser_message('','');

        load_kbucket_url(function(err,kbucket_url) {
            if (err) {
                show_full_browser_message('Spike Forest','Error loading kbucket_url: '+err);
                return;
            }
            var manager=new SFManager();
            manager.setConfig(config);
            manager.setKBucketUrl(kbucket_url);

            var X=new SFMainWindow();
            X.setSFManager(manager);
            X.showFullBrowser();
        });

        
    });
}

function load_kbucket_url(callback) {
    jsu_http_get_json('api/getKBucketUrl',{},function(tmp) {
        if (!tmp.success) {
            callback(tmp.error);
            return;
        }
        if (!tmp.object.success) {
            callback(tmp.object.error);
            return;
        }
        callback(null,tmp.object.kbucket_url);
    });
}

function load_config(config_id,callback) {
    if (!config_id) {
        
        callback(null,sample_spikeforest_json.data);
        return;

        callback('Missing query parameter: config_id');
        return;
    }
    jsu_http_get_json('api/getConfig?id='+config_id,{},function(tmp) {
        if (!tmp.success) {
            callback(tmp.error);
            return;
        }
        if (!tmp.object.success) {
            callback(tmp.object.error);
            return;
        }
        var config_obj=try_parse_json(tmp.object.config);
        if (!config_obj) {
            console.log (tmp.object);
            callback('Error parsing config string.');
            return;
        }
        callback(null,config_obj);
    });
}

function MessageWidget(O) {
    O=O||this;
    JSQWidget(O);
    O.div().addClass('MessageWidget');

    this.setMessage=function(msg) {m_message=msg; refresh();};
    this.setSubmessage=function(msg) {m_submessage=msg; refresh();};
    this.message=function() {return m_message;};
    this.submessage=function() {return m_submessage;};

    var m_message='';
    var m_submessage;

    function refresh() {
        O.div().html('<h2>'+m_message+'</h2><h3>'+m_submessage+'</h3>');
    }
}

var s_message_widget=new MessageWidget();
function show_full_browser_message(msg,submessage) {
    var X=s_message_widget;
    X.setMessage(msg);
    X.setSubmessage(submessage);
    X.showFullBrowser();
}

function try_parse_json(str) {
    try {
        return JSON.parse(str);
    }
    catch(err) {
        return null;
    }
}

function ends_with(str,str2) {
    return (str.slice(str.length-str2.length)==str2);
}

//window.callbacks={};
//var s_last_cb_code=0;

var sample_spikeforest_json={
    "type": "spikeforest",
    "data": {
        "results": [
            {
                "dataset_id": "K15",
                "algorithm_name": "alg1",
                "result": {
                    "firings": {
                        "prv": {
                            "original_checksum": "b361647eb563df430547d2d53c2e41e63d1c716c",
                            "original_fcs": "head1000-81339fa6a08bb7010353c9768a35a82cc98306eb",
                            "original_path": "/home/magland/prvbucket/_mountainprocess/output_firings_out_de5a1f622f",
                            "original_size": 336788,
                            "prv_version": "0.11"
                        }
                    },
                    "summary_data": {
                        "templates": {
                            "prv": {
                                "original_checksum": "adda17d2a2f99991f1bfaa66d44f22522c1b3bf5",
                                "original_fcs": "head1000-d5b4c45906e451e43a4ecb793e08f0130f46ea75",
                                "original_path": "/home/magland/prvbucket/_mountainprocess/output_templates_out_aacd7f8e1f",
                                "original_size": 38424,
                                "prv_version": "0.11"
                            }
                        }
                    },
                    "validation_data": {
                        "confusion_matrix": {
                            "prv": {
                                "original_checksum": "539f19524514dd033fb078e99bee11137d6648e6",
                                "original_fcs": "head1000-dcd18bf3761798b410467edb4e49a30b47c6f5e3",
                                "original_path": "/home/magland/prvbucket/_mountainprocess/output_confusion_matrix_out_a32ceb7915",
                                "original_size": 1684,
                                "prv_version": "0.11"
                            }
                        }
                    }
                }
            },
            {
                "dataset_id": "K15",
                "algorithm_name": "alg2",
                "result": {
                    "firings": {
                        "prv": {
                            "original_checksum": "8f0057a2884c947d94d6c52d0260aee7bbf46b3b",
                            "original_fcs": "head1000-2e2e56de2a7176acdf82598e7909100e4793ae6b",
                            "original_path": "/home/magland/prvbucket/_mountainprocess/output_firings_out_428d5dffd1",
                            "original_size": 2084492,
                            "prv_version": "0.11"
                        }
                    },
                    "summary_data": {
                        "templates": {
                            "prv": {
                                "original_checksum": "f28b08a1b9e321626ad517172a4372ef2410dcbd",
                                "original_fcs": "head1000-a254a4dc5380c5e3b56f0d2c56d07bd24a97b26b",
                                "original_path": "/home/magland/prvbucket/_mountainprocess/output_templates_out_e672eecbec",
                                "original_size": 38424,
                                "prv_version": "0.11"
                            }
                        }
                    },
                    "validation_data": {
                        "confusion_matrix": {
                            "prv": {
                                "original_checksum": "a959f88d8bea8bfa18a8a3bb23eb6bd1f00d564b",
                                "original_fcs": "head1000-e0616992bd83c14a7d266b7047b431dcdfd1def1",
                                "original_path": "/home/magland/prvbucket/_mountainprocess/output_confusion_matrix_out_bf1b3581e8",
                                "original_size": 1684,
                                "prv_version": "0.11"
                            }
                        }
                    }
                }
            },
            {
                "dataset_id": "K30",
                "algorithm_name": "alg1",
                "result": {
                    "firings": {
                        "prv": {
                            "original_checksum": "6be891304fb2c9791ac94262ef8bcd848b73dfda",
                            "original_fcs": "head1000-205a5f6ebbfdaaddc9e343b6bfe03741d3906d9d",
                            "original_path": "/home/magland/prvbucket/_mountainprocess/output_firings_out_a9d037a0a3",
                            "original_size": 486212,
                            "prv_version": "0.11"
                        }
                    },
                    "summary_data": {
                        "templates": {
                            "prv": {
                                "original_checksum": "4853b4e56f1330078e8de6dfbc84ec63e3e2c4ba",
                                "original_fcs": "head1000-3b3338b826a277589b626a4d84316643a3fffb97",
                                "original_path": "/home/magland/prvbucket/_mountainprocess/output_templates_out_4d7a588b1e",
                                "original_size": 60824,
                                "prv_version": "0.11"
                            }
                        }
                    },
                    "validation_data": {
                        "confusion_matrix": {
                            "prv": {
                                "original_checksum": "eba72ed3b619cf733c5f56064d9620a344ebd7fa",
                                "original_fcs": "head1000-7500eb189f6db7fcd3f836a8633e17c02ee56853",
                                "original_path": "/home/magland/prvbucket/_mountainprocess/output_confusion_matrix_out_ccd5a0edaa",
                                "original_size": 4980,
                                "prv_version": "0.11"
                            }
                        }
                    }
                }
            },
            {
                "dataset_id": "K30",
                "algorithm_name": "alg2",
                "result": {
                    "firings": {
                        "prv": {
                            "original_checksum": "2c697ff022c5a10057ceb53e9dd4c50ee07d297f",
                            "original_fcs": "head1000-b37c867165d6fb5ba0b67ea182f294f4d2910d22",
                            "original_path": "/home/magland/prvbucket/_mountainprocess/output_firings_out_90ea6be1d4",
                            "original_size": 2190404,
                            "prv_version": "0.11"
                        }
                    },
                    "summary_data": {
                        "templates": {
                            "prv": {
                                "original_checksum": "c46873bf29c2399d8dcfc7e8edb5b52bd2ffdc3a",
                                "original_fcs": "head1000-6a8f73245c240fd80b9fa9aa74d67a4314ce94a1",
                                "original_path": "/home/magland/prvbucket/_mountainprocess/output_templates_out_49edb04700",
                                "original_size": 60824,
                                "prv_version": "0.11"
                            }
                        }
                    },
                    "validation_data": {
                        "confusion_matrix": {
                            "prv": {
                                "original_checksum": "71d3c2f4a2287e72064343eb46f64faaeb794251",
                                "original_fcs": "head1000-2e0f25f2e896f50d651258466b1b91fb48888928",
                                "original_path": "/home/magland/prvbucket/_mountainprocess/output_confusion_matrix_out_d2c832223e",
                                "original_size": 4980,
                                "prv_version": "0.11"
                            }
                        }
                    }
                }
            },
            {
                "dataset_id": "K60",
                "algorithm_name": "alg1",
                "result": {
                    "firings": {
                        "prv": {
                            "original_checksum": "46d8f05331e8dc1ed62d79a79806ae226a139d51",
                            "original_fcs": "head1000-3d1dfb81cf5b2639bdadc91b29ab11084ef076be",
                            "original_path": "/home/magland/prvbucket/_mountainprocess/output_firings_out_76c268a6df",
                            "original_size": 1090172,
                            "prv_version": "0.11"
                        }
                    },
                    "summary_data": {
                        "templates": {
                            "prv": {
                                "original_checksum": "df23f2284b0ea87628465951e02642a1f080f51d",
                                "original_fcs": "head1000-1edbfc292581310099132a948af58440ab812fc9",
                                "original_path": "/home/magland/prvbucket/_mountainprocess/output_templates_out_67acdc5fad",
                                "original_size": 128024,
                                "prv_version": "0.11"
                            }
                        }
                    },
                    "validation_data": {
                        "confusion_matrix": {
                            "prv": {
                                "original_checksum": "9461fe4deb2bd9d291a61b0334c5db77cff19085",
                                "original_fcs": "head1000-7af0ef16c115c6dac501414a9370b8ca7ae33297",
                                "original_path": "/home/magland/prvbucket/_mountainprocess/output_confusion_matrix_out_33705186ca",
                                "original_size": 20028,
                                "prv_version": "0.11"
                            }
                        }
                    }
                }
            },
            {
                "dataset_id": "K60",
                "algorithm_name": "alg2",
                "result": {
                    "firings": {
                        "prv": {
                            "original_checksum": "95013b855767df711160598fe8ec276e57cb07e0",
                            "original_fcs": "head1000-00ed202d2d12454e02ff847dd0c8bf8482bbe9f5",
                            "original_path": "/home/magland/prvbucket/_mountainprocess/output_firings_out_66f7b25df0",
                            "original_size": 1980476,
                            "prv_version": "0.11"
                        }
                    },
                    "summary_data": {
                        "templates": {
                            "prv": {
                                "original_checksum": "6093b84710a348be1a931b42644a7a7c5291daa0",
                                "original_fcs": "head1000-1edbfc292581310099132a948af58440ab812fc9",
                                "original_path": "/home/magland/prvbucket/_mountainprocess/output_templates_out_86c300dc7c",
                                "original_size": 128024,
                                "prv_version": "0.11"
                            }
                        }
                    },
                    "validation_data": {
                        "confusion_matrix": {
                            "prv": {
                                "original_checksum": "b28e9007af408207aca4b472bbb078efd8a84c97",
                                "original_fcs": "head1000-7af0ef16c115c6dac501414a9370b8ca7ae33297",
                                "original_path": "/home/magland/prvbucket/_mountainprocess/output_confusion_matrix_out_d694596463",
                                "original_size": 20028,
                                "prv_version": "0.11"
                            }
                        }
                    }
                }
            }
        ],
        "algorithms": [
            {
                "name": "alg1"
            },
            {
                "name": "alg2"
            }
        ],
        "datasets": [
            {
                "id": "K15",
                "dataset": {
                    "files": {
                        "firings_true.mda": {
                            "prv": {
                                "original_checksum": "5fb95bede27a48e679cef376e504e7125f60bd83",
                                "original_fcs": "head1000-5a26c085df3b5c8874c30b77a8609fa685fc10ea",
                                "original_path": "/home/magland/dev/fi_ss/analyses/synth/sims_for_neuron_paper/generate_datasets/../project/raw/firings_tet_K=15_1.mda",
                                "original_size": 265040,
                                "prv_version": "0.11"
                            }
                        },
                        "raw.mda": {
                            "prv": {
                                "original_checksum": "28f70121ccd04ac774f7a11dfab4ccce4bc8e0ea",
                                "original_fcs": "head1000-04eb39086a5aeec9ee56979a85cc12a9ff7b8a67",
                                "original_path": "/home/magland/dev/fi_ss/analyses/synth/sims_for_neuron_paper/generate_datasets/../project/raw/tet_K=15_1.mda",
                                "original_size": 257589652,
                                "prv_version": "0.11"
                            }
                        },
                        "waveforms_true.mda": {
                            "prv": {
                                "original_checksum": "d51d07845f5a1e5377e04c29b1ef7ba289844437",
                                "original_fcs": "head1000-f8abfa9477115a61b7b011d2f627a7120f22f120",
                                "original_path": "waveforms_true.mda",
                                "original_size": 2496024,
                                "prv_version": "0.11"
                            }
                        }
                    },
                    "parameters": {
                        "samplerate": 30000,
                        "detect_sign": 1
                    },
                    "properties": {
                        "description": "One of the synthetic datasets used for Figure 6 in the MountainSort Neuron paper.\n\nFor information on working with ML studies, see the following example:\nhttps://github.com/flatironinstitute/mountainsort_examples/tree/master/devel/neuron_synth\n\nThese datasets were generated using a matlab script. The source code can be found here:\n\nhttps://github.com/magland/fi_ss/tree/master/analyses/manuscript/synthetic"
                    },
                    "has_ground_truth": true
                }
            },
            {
                "id": "K30",
                "dataset": {
                    "files": {
                        "firings_true.mda": {
                            "prv": {
                                "original_checksum": "8617e632837223ef5f265587d5dc7809d1d49957",
                                "original_fcs": "head1000-e0318afda0817bc309ba14e54d744182524f15ff",
                                "original_path": "/home/magland/dev/fi_ss/analyses/synth/sims_for_neuron_paper/generate_datasets/../project/raw/firings_tet_K=30_1.mda",
                                "original_size": 602240,
                                "prv_version": "0.11"
                            }
                        },
                        "raw.mda": {
                            "prv": {
                                "original_checksum": "f917f9dfa1864aa9ebb72987d5f0a2f811d5e1a1",
                                "original_fcs": "head1000-8e16d93118ad0809b3c99740e0ad5176c8b0c7a8",
                                "original_path": "tet_K=30_1.mda",
                                "original_size": 257589652,
                                "prv_version": "0.11"
                            }
                        },
                        "waveforms_true.mda": {
                            "prv": {
                                "original_checksum": "f6e4705be20366cd9aec17cbf723f8184d334ffc",
                                "original_fcs": "head1000-463f4b79829679bd3ea56722a84fed32f671bf51",
                                "original_path": "waveforms_true.mda",
                                "original_size": 4992024,
                                "prv_version": "0.11"
                            }
                        }
                    },
                    "parameters": {
                        "samplerate": 30000,
                        "detect_sign": 1
                    },
                    "properties": {
                        "description": "One of the synthetic datasets used for Figure 6 in the MountainSort Neuron paper."
                    },
                    "has_ground_truth": true
                }
            },
            {
                "id": "K60",
                "dataset": {
                    "files": {
                        "firings_true.mda": {
                            "prv": {
                                "original_checksum": "fbb3f86381e7bf3b89fdd2526f423011c18cb46f",
                                "original_fcs": "head1000-27f7876577e747fa69983401170b93f92513d553",
                                "original_path": "/home/magland/dev/fi_ss/analyses/synth/sims_for_neuron_paper/generate_datasets/../project/raw/firings_tet_K=60_1.mda",
                                "original_size": 1235600,
                                "prv_version": "0.11"
                            }
                        },
                        "raw.mda": {
                            "prv": {
                                "original_checksum": "1f92719f9235d38351e92bdfce4e8f446b96f4d6",
                                "original_fcs": "head1000-08034ed2d06c3f82fd0f2627ffa3aef9da20b1a3",
                                "original_path": "/home/magland/dev/fi_ss/analyses/synth/sims_for_neuron_paper/generate_datasets/../project/raw/tet_K=60_1.mda",
                                "original_size": 257589652,
                                "prv_version": "0.11"
                            }
                        },
                        "waveforms_true.mda": {
                            "prv": {
                                "original_checksum": "fe64daff393314f38ad4063085e7480710c48564",
                                "original_fcs": "head1000-ba2ae5d9813e04ab35c0dc27599f12eed722f0c7",
                                "original_path": "waveforms_true.mda",
                                "original_size": 9984024,
                                "prv_version": "0.11"
                            }
                        }
                    },
                    "parameters": {
                        "samplerate": 30000,
                        "detect_sign": 1
                    },
                    "properties": {
                        "description": "One of the synthetic datasets used for Figure 6 in the MountainSort Neuron paper."
                    },
                    "has_ground_truth": true
                }
            }
        ]
    }
};