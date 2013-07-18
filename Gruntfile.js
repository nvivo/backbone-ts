module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-typescript');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        typescript: {
            base: {
                src: [
					'src/Backbone.ts'
				],
                dest: 'build/backbone.js',
                options: {
                    target: 'es5',
					declaration: true,
					disallowbool: true,
					disallowimportmodule: true
                }
            }
        },
    });

    // Default task(s).
    grunt.registerTask('default', ['typescript']);
};