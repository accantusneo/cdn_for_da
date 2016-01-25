module.exports = function (grunt) {
    'use strict';
    grunt.initConfig({
        //Read the file package.json.
        pkg: grunt.file.readJSON("package.json"),
        js_src_path: 'src/js', //Property that sotres sorce path to the codes. (Useful in the the configuration).
        js_distro_path_js: 'dist/js',
        css_src_path: 'src/css',
        css_distro_path: 'dist/css',
        js_src_test: 'test',


        /*
        This package creates the required directory structure for the project.
        */
        mkdir: {
            all: {
                options: {
                    create: [
                    'dist',
                    'dist/js',
                    'dist/css',
                    'lib',
                    'test',
                    'test/data',
                    'test/unit',
                    'example',
                    'lib/css',
                    'lib/js',
                    'src',
                    'src/js',
                    'src/css']
                }
            }
        },

        /*
        This package downloads each required library file mentioned in the configuration and stored them in
        the location mentioned.
        */
        'curl-dir': {
            'lib/js': [
                        'http://code.jquery.com/qunit/qunit-1.18.0.js',
                        'http://code.jquery.com/jquery-1.11.3.js'
                    ],
            'lib/css': ['http://code.jquery.com/qunit/qunit-1.18.0.css']
        },

        /*
        This package concats all the files in the source ("src") configuration to one file and store it in destination
        location mentioned.

        In this configuration :
            1. All the code files will be concatinated as allCodes.js and stored at dist/
            2. All the test files (*.js) will be concatinated and stored at dist/
        */
        concat:{
            "js":{
                "src":[
                    '<%= js_src_path %>/com.charts.js',
                    '<%= js_src_path %>/global_objects.js',
                    '<%= js_src_path %>/mediator.js',
                    '<%= js_src_path %>/utility.js',
                    '<%= js_src_path %>/errors.js',
                    '<%= js_src_path %>/api/api.js',

                    '<%= js_src_path %>/data/dataquery.js',
                    '<%= js_src_path %>/data/data_manipulation.js',
                    '<%= js_src_path %>/data/get_data.js',
                    '<%= js_src_path %>/data/livedata.js',
                    '<%= js_src_path %>/data/smoothing.js',
                    '<%= js_src_path %>/data/number_format.js',
                    '<%= js_src_path %>/date/date_format.js',

                    '<%= js_src_path %>/config_validation.js',
                    '<%= js_src_path %>/caption_subCaption.js',
                    '<%= js_src_path %>/svg.js',
                    '<%= js_src_path %>/x_axis.js',
                    '<%= js_src_path %>/y_axis.js',
                    '<%= js_src_path %>/crosshair.js',
                    '<%= js_src_path %>/line_chart.js',
                    '<%= js_src_path %>/view/modal.js',
                    '<%= js_src_path %>dimensional_analysis.js',
                    '<%= js_src_path %>/com.charts_end.js'
                ],
                "dest": '<%= js_distro_path_js %>/<%= pkg.name %>.<%= pkg.version %>.js'
            }
            //,
            // "test":{
            //     "src":[
            //         '<%= js_src_test %>/unit/validation_test.js',
            //         '<%= js_src_test %>/unit/cell_test.js',
            //         '<%= js_src_test %>/unit/view_div_test.js',
            //         '<%= js_src_test %>/unit/timeseries-dom_test.js',
            //         '<%= js_src_test %>/unit/timeseries-mediator_test.js',
            //         '<%= js_src_test %>/unit/timeseries-facade_test.js'
            //     ],
            //     "dest": '<%= js_distro_path_js %>/<%= pkg.name %>.<%= pkg.version %>.test.js'
            // }

        },

        /*
        This package will minify the css files mentioned in the source of configuration.
        */
        cssmin: {
            my_target: {
                files:[{
                    expand: true,
                    cwd: 'src/css',
                    src: ['*.css',"!*.min.css"],
                    dest: 'dist/css',
                    ext: '.min.css'
                }]
            }
        },

        /*
        This package will run the test on a "test.html" file in /src/test.
        '<%= js_src_test %>/test.html'
        */
        qunit:{
            all:['<%= js_src_test %>/test.html','<%= js_src_test %>/timeseries_test.html','<%= js_src_test %>/static_chart_test.html']
        },

        uglify: {
            'my_target': {
                'files': {
                '<%= js_distro_path_js %>/<%= pkg.name %>.<%= pkg.version %>.min.js': // destination
                    ['<%= js_distro_path_js %>/<%= pkg.name %>.<%= pkg.version %>.js'], // source
                // '<%= js_distro_path_js %>/<%= pkg.name %>.<%= pkg.version %>.test.min.js': // destination
                // ['<%= js_distro_path_js %>/<%= pkg.name %>.<%= pkg.version %>.test.js'] // source
                }
            },
            'options': {
              'preserveComments': 'some'
            }
        },

        //Coding Style guide.
        /*
            loopfunc:true - This option suppresses warnings about functions inside of loops.
        */
        jshint: {
            options: {
                loopfunc:true
            },
            all: [
                'Gruntfile.js',
                '<%= js_src_path %>/view/*.js',
                '<%= js_src_path %>/data/*.js',
                '<%= js_src_path %>/chart/*.js'
                ]
        },

        //Clean the git-precommit...
        clean: {
            // Clean any pre-commit hooks in .git/hooks directory
            hooks: ['.git/hooks/pre-commit']
        },


        // Run shell commands
        shell: {
            hooks: {
                // Copy the project's pre-commit hook into .git/hooks
                command: 'cp git-hooks/pre-commit .git/hooks/pre-commit'
            },
            changeMods: {
                command: 'chmod 755 .git/hooks/pre-commit'
            }
        },

        //Remove console logs...
        removelogging: {
            dist: {
                src: ['<%= js_distro_path_js %>/*.js','<%= js_distro_path_js %>/!*.min.js'],
                options: {}
            }
        },

        /*
            Remove the code included in source files for testing.
            The test code is removed from the distribution file.
        */
        strip_code: {
            options: {
                start_comment: 'start-test-block',
                end_comment: 'end-test-block',
            },
            src:  {src: '<%= js_distro_path_js %>/<%= pkg.name %>.<%= pkg.version %>.js', dest: '<%= js_distro_path_js %>/<%= pkg.name %>.<%= pkg.version %>.js'}
        },

        karma: {
            unit:{
                options: {
                    frameworks: ['qunit'],
                    captureTimeout: 60000,
                    logLevel: 'INFO',
                    //client: { captureConsole: false },
                    exclude: [
                        'test/unit/cell_test.js',
                        'test/unit/view_div_test.js',
                        'test/unit/view_container_test.js',
                        'test/unit/rearrangement_test.js'
                    ],
                    files:[

                        {pattern: 'test/unit/htmlElements.js', watched: false, included: true, served: true},


                        {pattern: 'lib/d3/d3.min.js', watched: true, included: true, served: true},
                        {pattern: 'lib/js/crossfilter.js', watched: true, included: true, served: true},
                        {pattern: 'lib/js/jquery.js', watched: true, included: true, served: true},
                        {pattern: 'lib/js/moment.min.js', watched: true, included: true, served: true},

                        {pattern: '<%= js_src_path %>/utility/global_objects.js', watched: true, included: true, served: true},

                        {pattern: '<%= js_src_path %>/mediator/mediator.js', watched: true, included: true, served: true},
                        {pattern: '<%= js_src_path %>/utility/utility.js', watched: true, included: true, served: true},
                        {pattern: '<%= js_src_path %>/utility/errors.js', watched: true, included: true, served: true},
                        {pattern: '<%= js_src_path %>/utility/help.js', watched: true, included: true, served: true},

                        {pattern: '<%= js_src_path %>/data/*.js', watched: true, included: true, served: true},
                        {pattern: '<%= js_src_path %>/date/*.js', watched: true, included: true, served: true},
                        {pattern: '<%= js_src_path %>/chart/*.js', watched: true, included: true, served: true},

                        {pattern: '<%= js_src_path %>/view/menu_bar.js', watched: true, included: true, served: true},
                        {pattern: '<%= js_src_path %>/view/modal.js', watched: true, included: true, served: true},
                        {pattern: '<%= js_src_path %>/view/chart_menu.js', watched: true, included: true, served: true},

                        {pattern: '<%= js_src_path %>/features/*.js', watched: true, included: true, served: true},

                        // {pattern: '<%= js_src_test %>/unit/*.js', watched: true, included: true, served: true},

                        {pattern: 'examples/data/*.csv', watched: false, included: false, served: true},

                        //timeseries_test.html
                        {pattern: 'test/unit/x_axis_test.js', watched: false, included: true, served: true},
                        {pattern: 'test/unit/y_axis_test.js', watched: false, included: true, served: true},
                        {pattern: 'test/unit/config_validation_test.js', watched: false, included: true, served: true},
                        {pattern: 'test/unit/date_format_test.js', watched: false, included: true, served: true},
                        {pattern: 'test/unit/get_data_test.js', watched: false, included: true, served: true},
                        {pattern: 'test/unit/data_manipulation_test.js', watched: false, included: true, served: true},
                        {pattern: 'test/unit/anomaly_detection_test.js', watched: false, included: true, served: true},
                        {pattern: 'test/unit/number_format_test.js', watched: false, included: true, served: true},
                        {pattern: 'test/unit/smoothing_test.js', watched: false, included: true, served: true},

                        //test.html
                        {pattern: 'test/unit/dataquery_test.js', watched: false, included: true, served: true},
                        {pattern: 'test/unit/livedata_test.js', watched: false, included: true, served: true},
                        {pattern: 'test/unit/mediator_test.js', watched: false, included: true, served: true},
                        {pattern: 'test/unit/svg_test.js', watched: false, included: true, served: true},

                        //static_chart_test.html

                    ],
                    proxies: {
                        '/examples/data/': '/base/examples/data'
                    },
                    browsers: ["Chrome",'Firefox']//,'PhantomJS']
                }
            }
        }


    });

    //Loading all the packages required.
    grunt.loadNpmTasks('grunt-mkdir');
    grunt.loadNpmTasks('grunt-curl');
    grunt.loadNpmTasks('grunt-shell');

    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.loadNpmTasks('grunt-remove-logging');
    grunt.loadNpmTasks('grunt-strip-code');
    grunt.loadNpmTasks('grunt-karma');



    //Register a task to remove the test code.
    grunt.registerTask('strip',['strip_code']);

    //Register a task called "template" and on command execution run the task mkdir and then curl-dir.
    grunt.registerTask('template',['mkdir','curl-dir']);

    //Register a task called "minify" and on command execution run the task concat and then uglify.
    grunt.registerTask('minify',['concat','uglify']);


    //Register a task called "test" and on command execution run the task concat and then qunit.
    grunt.registerTask('test', ['jshint','qunit']);

    // Clean the .git/hooks/pre-commit file then copy in the latest version.
    grunt.registerTask('hookmeup', ['clean:hooks', 'shell']);

    //Registering a build task.
    grunt.registerTask('build', ['jshint', 'hookmeup']);

    //Registering a build task.
    //grunt.registerTask('build', ['concat','strip_code','jshint', 'removelogging', 'cssmin', 'hookmeup']);
};