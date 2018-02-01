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
if (typeof module !== 'undefined' && module.exports) {
	exports.LocalStorage=LocalStorage;
}

function LocalStorage() {
	this.allNames=function() {return allNames();};
	this.writeObject=function(name,obj) {return writeObject(name,obj);};
	this.readObject=function(name) {return readObject(name);};

	function writeObject(name,obj) {
		try {
			localStorage[name]=JSON.stringify(obj);
			return true;
		}
		catch(err) {
			return false;
		}
	}
	function readObject(name) {
		var obj;
		try {
			var json=localStorage[name];
			if (!json) return null;
			obj=JSON.parse(json);
			return obj;
		}
		catch(err) {
			return null;
		}
	}
	function allNames() {
		var ret=[];
		try {
			for (var name in localStorage) {
				ret.push(name);
			}
		}
		catch(err) {

		}
		return ret;
	}
}