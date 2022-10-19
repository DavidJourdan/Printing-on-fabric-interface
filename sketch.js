var Settings = function () {
  this.display_border = true;
  this.border_length = 1;
  this.Scale = 60;
  this.Rings = 3;
  this.young_modulus = 23000;
  this.Thickness = 0.3;
  this.Branches = 3;
  this.Width = 1;
  this.Size = 10;
  this.boundary = 0.7;
  this.input_name = '1'
  this.output_name = '1'
  this.output_folder = 'test';
  this.Update = function () {
    for (var s of stars) {
      if (s.selected) {
        s.young_modulus = this.young_modulus;
        s.thickness = this.Yhickness;
        s.nb_branches = this.Branches;
        s.width = this.Width;
        s.size = this.Size;
        s.selected = false;
      }
    }
  }
  this.Unselect = function () {
    for (var s of stars) {
      s.selected = false;
    }
  }
  // this.generate_command = generate_command;
  // this.generate_scad = generate_scad;
  // this.save_to_svg = function () {
  //   let minX = 100000, minY = 100000, maxX = -100000, maxY = -100000;

  //   let margin = -0.4 * settings.Scale;
  //   if (settings.display_border)
  //     margin = 5;

  //   for (let v of border) {
  //     if (v.x < minX)
  //       minX = v.x - margin;
  //     if (v.y < minY)
  //       minY = v.y - margin;
  //     if (v.x > maxX)
  //       maxX = v.x + margin;
  //     if (v.y > maxY)
  //       maxY = v.y + margin;
  //   }

  //   let prevValue = document.body.childNodes[3].firstChild.attributes[5].value;
  //   document.body.childNodes[3].firstChild.attributes[3].value = maxX - minX;
  //   document.body.childNodes[3].firstChild.attributes[4].value = maxY - minY;
  //   document.body.childNodes[3].firstChild.attributes[5].value = minX + " " + minY + " " + (maxX - minX) + " " + (maxY - minY);

  //   let text = document.body.childNodes[3].innerHTML;

  //   let fileName = "img.svg";

  //   let element = document.createElement("a");
  //   element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  //   element.setAttribute("download", fileName);

  //   element.style.display = "none";
  //   document.body.appendChild(element);

  //   element.click();

  //   document.body.removeChild(element);

  //   document.body.childNodes[3].firstChild.attributes[3].value = window.innerWidth;
  //   document.body.childNodes[3].firstChild.attributes[4].value = window.innerHeight;
  //   document.body.childNodes[3].firstChild.attributes[5].value = prevValue;
  //   console.log("don't forget to add SVG in createCanvas");
  // };
//   this.modify_border = function () {
//     for (let i = 0; i < 6; i++) {
//       border.splice(2 * i, 0, border[2 * i].copy());
//     }
//     for (let i = 0; i < 6; i++) {
//       border[2 * i + 1].add(border[(2 * i + 2) % 12]).mult(0.5);
//     }
//   };
//   this.save_to_json = function () {
//     let text = JSON.stringify({ border: border, stars: stars, scale: settings.Scale });
//     let fileName = "data.json";

//     let element = document.createElement("a");
//     element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
//     element.setAttribute("download", fileName);

//     element.style.display = "none";
//     document.body.appendChild(element);

//     element.click();
//   };
//   this.load_json = function () {
//     const fileSelector = document.getElementById('myInput');
//     fileSelector.addEventListener('change', (event) => {
//       const file = event.target.files[0];
//       console.log(file);
//       const reader = new FileReader();
//       reader.addEventListener('load', (event) => {
//         const data = JSON.parse(event.target.result);
//         border = data.border;
//         stars = data.stars;
//         settings.Scale = data.scale;
//       });
//       reader.readAsText(file);
//     });
//     fileSelector.click();
//   };
}

var Star = function (x, y) {
  this.x = x;
  this.y = y;
  this.young_modulus = 23000;
  this.thickness = 0.3;
  this.width = 1;
  this.selected = false;
  this.size = 10;
  this.nb_branches = 3;
}

var settings = new Settings();
settings["Export to sim"] = generate_layout;
settings["Export to IceSL"] = function() {
  let text = `
function star(length, thickness, width, nb_branches)
  branch = translate(0, length / 2, 0) * cube(width, length, thickness)
  branches = {}
  for i = 1,nb_branches do
    branches[i] = rotate(360*i/nb_branches, Z) * branch
  end
  return union(branches)
end

function boundary(points)
  inner = {}
  outer = {}
  shift = 1.42 *  0.2
  for i =1,table.getn(points) do
    inner[i] = points[i] - shift * normalize(points[i])
    outer[i] = points[i] + shift * normalize(points[i])
  end
  return difference(linear_extrude(0.2*Z, outer), linear_extrude(Z, inner))
end

stars = {\n`;

  for (let s of stars) {
    if (s.young_modulus != 0) {
      let x = s.x * 10;
      let y = -s.y * 10;

      text += "{" + x + ", " + y + ", " + s.size + ", " + s.thickness + ", " + s.width + ", " + s.nb_branches + "},\n";
    }
  }
  text += "}\nborder = {\n";

  // perimeter
  for (let v of border) {
    let x = 10 * v.x;
    let y = -10 * v.y;
    text += "v(" + x + ", " + y + "),\n";
  }
  text += `}

for i=1,table.getn(stars) do
  s = stars[i]
  emit(translate(s[1], s[2], 0) * star(s[3], s[4], s[5], s[6]))
end

emit(boundary(border))
  `;

  let fileName = "stars.lua";

  let element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", fileName);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2;
// var size = 100;
var stars = new Array();
var currentStar = new Star(0, 0);
var border = new Array();

function generate_command() {
  var command = "./coupling -in ../../data/";
  switch (settings.Rings) {
    case 0:
      command += "1star/" + settings.input_name + " -out ../../data/" + settings.output_folder
        + "/1star/" + settings.output_name + " ";
      break;
    case 1:
      command += "7star/" + settings.input_name + " -out ../../data/" + settings.output_folder
        + "/7star/" + settings.output_name + " ";
      break;
    case 2:
      command += "19star/" + settings.input_name + " -out ../../data/" + settings.output_folder
        + "/19star/" + settings.output_name + " ";
      break;
    case 3:
      command += "37star/" + settings.input_name + " -out ../../data/" + settings.output_folder
        + "/37star/" + settings.output_name + " ";
      break;
    case 4:
      command += "61star/" + settings.input_name + " -out ../../data/" + settings.output_folder
        + "/61star/" + settings.output_name + " ";
      break;
    case 5:
      command += "91star/" + settings.input_name + " -out ../../data/" + settings.output_folder
        + "/91star/" + settings.output_name + " ";
      break;
    default:
      command = "error";
  }

  command += "-wn ";
  for (var s of stars) {
    command += s.thickness.toFixed(2) + " ";
  }

  command += "-wb ";
  for (var s of stars) {
    command += s.width.toFixed(2) + " ";
  }

  command += "-rm ";
  for (var s of stars) {
    command += s.young_modulus + " ";
  }

  command += "-b " + settings.boundary;

  console.log(command);
}

function generate_layout() {
  var V = new Array();
  var E = new Array();

  var idx = 0;

  for (let s of stars) {
    if (s.young_modulus != 0) {
      var x = s.x * 10;
      var y = s.y * 10;

      V.push(x + " " + y + "\n");

      for (let i = 0; i < s.nb_branches; ++i) {
        V.push((x + s.size * cos(2 * PI * (i / s.nb_branches - 1 / 4))) + " " + (y + s.size * sin(2 * PI * (i / s.nb_branches - 1 / 4))) + "\n");
        E.push(idx + " " + (idx + i + 1));
      }

      idx += s.nb_branches + 1;
    }
  }

  // perimeter
  let i = 0;
  for (let v of border) {
    let x = 10 * v.x;
    let y = -10 * v.y;
    V.push(x + " " + y + "\n");

    E.push(idx + i + " " + ((i + 1 == border.length) ? idx : idx + i + 1));
    i++;
  }

  var layout = V.length + " " + E.length + " " + (E.length - border.length) + "\n";

  for (var v of V) {
    layout += v;
  }
  for (var e of E) {
    layout += e + "\n";
  }

  let element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(layout));
  element.setAttribute("download", "layout.txt");

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function generate_scad() {
  let text = "data = [\n";

  for (let s of stars) {
    if (s.young_modulus != 0) {
      let x = s.x * 10;
      let y = -s.y * 10;

      text += "[" + x + ", " + y + ", " + s.size + ", " + s.thickness + "],\n";
    }
  }
  text += "];\nborder = [\n";

  // perimeter
  for (let v of border) {
    let x = 10 * v.x;
    let y = -10 * v.y;
    text += "[" + x + ", " + y + "],\n";
  }
  text += "];\n";

  let fileName = "data.txt";

  let element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", fileName);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function hexagon(x, y, color) {
  noStroke();
  fill(color);
  beginShape();
  for (var i = 0; i < 6; i++) {
    vertex(x + 1.2 * settings.Scale * cos((2 * i + 1) / 6 * PI), y + 1.2 * settings.Scale * sin((2 * i + 1) / 6 * PI));
  }
  endShape(CLOSE);
  fill(255);
  stroke(0);
}

function draw_star(s) {
  length = settings.Scale * s.size / 10.;
  strokeWeight(8 * settings.Scale * s.width / 100);
  for (let i = 0; i < s.nb_branches; ++i) {
    line(
      centerX + settings.Scale * s.x, 
      centerY + settings.Scale * s.y, 
      centerX + settings.Scale * s.x + length * cos(2 * PI * (i / s.nb_branches - 1 / 4)), 
      centerY + settings.Scale * s.y + length * sin(2 * PI * (i / s.nb_branches - 1 / 4)));
  }
  strokeWeight(1);
}

function initialize_stars() {
  stars = new Array();
  stars.push(new Star(0, 0));

  for (var i = 1; i <= settings.Rings; ++i) {
    for (var j = 0; j < 6; ++j) {
      var prevX = i * sqrt(3) * cos((2 * j + 1) * PI / 6);
      var prevY = i * sqrt(3) * sin((2 * j + 1) * PI / 6);
      var nextX = i * sqrt(3) * cos((2 * j + 3) * PI / 6);
      var nextY = i * sqrt(3) * sin((2 * j + 3) * PI / 6);

      for (var k = 0; k < i; ++k) {
        stars.push(new Star((k * prevX + (i - k) * nextX) / i, (k * prevY + (i - k) * nextY) / i));
      }
    }
  }

  // perimeter
  border = new Array();
  for (var i = 0; i < 6; ++i) {
    var r = (settings.Rings * sqrt(3) + 1.5);

    border.push(new p5.Vector(r * cos((2 * i + 1) * PI / 6), r * sin((2 * i + 1) * PI / 6)));
  }
}

function update_stars() {
  var i = settings.Rings;
  if(stars.length < 1 + 3 * settings.Rings * (settings.Rings + 1)) {
    while(stars.length < 1 + 3 * settings.Rings * (settings.Rings + 1)) {
      for (var j = 0; j < 6; ++j) {
        var prevX = i * sqrt(3) * cos((2 * j + 1) * PI / 6);
        var prevY = i * sqrt(3) * sin((2 * j + 1) * PI / 6);
        var nextX = i * sqrt(3) * cos((2 * j + 3) * PI / 6);
        var nextY = i * sqrt(3) * sin((2 * j + 3) * PI / 6);

        for (var k = 0; k < i; ++k) {
          stars.push(new Star((k * prevX + (i - k) * nextX) / i, (k * prevY + (i - k) * nextY) / i));
        }
      }
      i = i - 1;
    }
  }
  else if(stars.length > 1 + 3 * settings.Rings * (settings.Rings + 1)) {
    stars = stars.slice(0, 1 + 3 * settings.Rings * (settings.Rings + 1));
  }

  // perimeter
  border = new Array();
  for (var i = 0; i < 6; ++i) {
    var r = (settings.Rings * sqrt(3) + 1.5);

    border.push(new p5.Vector(r * cos((2 * i + 1) * PI / 6), r * sin((2 * i + 1) * PI / 6)));
  }
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight, P2D);
  // scale(100);

  var gui = new dat.GUI();

  var f1 = gui.addFolder('Basic');
  f1.open();
  f1.add(settings, 'Rings', 0, 6).step(1).onChange(update_stars);
  f1.add(settings, 'Scale', 10, 200);
  // f1.add(settings, 'border_length', 0, 1).onChange(function () {
  //   let r = settings.Scale * (settings.Rings * sqrt(3) + 1.5);
  //   let a = new p5.Vector(r * cos(PI / 6) + centerX, r * sin(PI / 6) + centerY);
  //   let b = new p5.Vector(centerX, r + centerY);
  //   border[0] = a.mult(settings.border_length).add(b.mult(1 - settings.border_length));
  //   border[2] = new p5.Vector(2 * centerX - a.x, a.y);
  //   border[3] = new p5.Vector(2 * centerX - a.x, 2 * centerY - a.y);
  //   border[5] = new p5.Vector(a.x, 2 * centerY - a.y);
  // });
  // f1.add(settings, 'input_name');
  // f1.add(settings, 'output_name');
  // f1.add(settings, 'output_folder');

  var f2 = gui.addFolder('View star');
  f2.open();
  // f2.add(currentStar, 'young_modulus').listen();
  f2.add(currentStar, 'thickness').listen();
  f2.add(currentStar, 'width').listen();
  f2.add(currentStar, 'size').listen();

  var f3 = gui.addFolder('Change properties');
  f3.open();
  // f3.add(settings, 'young_modulus');
  f3.add(settings, 'Branches', 3, 8).step(1);
  f3.add(settings, 'Thickness').min(0).step(0.01);
  f3.add(settings, 'Width').min(0).step(0.1);
  f3.add(settings, 'Size').min(0).step(0.5);
  // f3.add(settings, 'boundary', 0, 1);
  f3.add(settings, 'Update');
  f3.add(settings, 'Unselect');

  // gui.add(settings, 'generate_command');
  gui.add(settings, 'Export to sim');
  gui.add(settings, 'Export to IceSL');
  // gui.add(settings, 'save_to_svg');
  // gui.add(settings, 'modify_border');
  // gui.add(settings, 'save_to_json');
  // gui.add(settings, 'load_json');

  initialize_stars();
}


function draw() {
  background(255);

  for (var s of stars) {
    if (s.selected)
    {
      var sx = centerX + settings.Scale * s.x;
      var sy = centerY + settings.Scale * s.y;
      hexagon(sx, sy, 240);
    }
  }

  for (var s of stars) {
    var sx = centerX + settings.Scale * s.x;
    var sy = centerY + settings.Scale * s.y;
    if (sqrt(sq(sx - mouseX) + sq(sy - mouseY)) < settings.Scale) {
      hexagon(sx, sy, 220);
      currentStar.thickness = s.thickness;
      currentStar.width = s.width;
      currentStar.young_modulus = s.young_modulus;
      currentStar.size = s.size;
    }
  }

  for (var s of stars) {
    if (s.young_modulus > 0.0)
      draw_star(s);
  }

  if (settings.display_border) {
    strokeWeight(8 * settings.Scale / 100);
    let prevVec = border[border.length - 1];
    for (let v of border) {
      line(
        centerX + settings.Scale * prevVec.x, 
        centerY + settings.Scale * prevVec.y, 
        centerX + settings.Scale * v.x, 
        centerY + settings.Scale * v.y);
      prevVec = v;
    }
    strokeWeight(1);
  }
}

function mousePressed() {
  var elementSelected = false;
  for (var s of stars) {
    var sx = centerX + settings.Scale * s.x;
    var sy = centerY + settings.Scale * s.y;
    if (sqrt(sq(sx - mouseX) + sq(sy - mouseY)) < settings.Scale) {
      s.selected = !s.selected;
      elementSelected = true;
    }
  }

  // if (!elementSelected) {
  //   for (var s of stars) {
  //     s.selected = false;
  //   }
  // }
}
