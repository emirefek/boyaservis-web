const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

class Resize {
  constructor(folder, resolution) {
    this.folder = folder;
    this.resolution = resolution;
  }
  async save(buffer) {
    const filename = Resize.filename();
    const filepath = this.filepath(filename);

    await sharp(buffer)
      .resize(this.resolution, this.resolution, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toFile(filepath);

    return filename;
  }
  static filename() {
    return `${uuidv4()}.png`;
  }
  filepath(filename) {
    return path.resolve(`${this.folder}/${filename}`);
  }
}

module.exports = Resize;
