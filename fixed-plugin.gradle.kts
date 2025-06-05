import org.gradle.api.tasks.bundling.Jar
import org.gradle.api.tasks.testing.Test
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm")
    `java-gradle-plugin`
    `maven-publish`
}

group = "com.facebook.react"

repositories {
    mavenCentral()
    google()
}

dependencies {
    implementation(gradleApi())

    implementation("com.android.tools.build:gradle:7.4.2")
    implementation("com.google.code.gson:gson:2.8.9")

    testImplementation(gradleTestKit())
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.assertj:assertj-core:3.21.0")
}

gradlePlugin {
    plugins {
        create("react") {
            id = "com.facebook.react"
            implementationClass = "com.facebook.react.ReactPlugin"
        }
    }
}

java {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
}

kotlin {
    tasks.withType<KotlinCompile>().configureEach {
        kotlinOptions {
            jvmTarget = JavaVersion.VERSION_11.toString()
            // Fetch the property safely as a String?
            val enableWarnings = project.findProperty("enableWarningsAsErrors") as String?
            // Set allWarningsAsErrors as Boolean
            allWarningsAsErrors = enableWarnings?.toBoolean() ?: false
        }
    }
}

tasks.withType<Test>().configureEach {
    testLogging {
        exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL
        showStandardStreams = true
        showStackTraces = true
        showCauses = true
    }
}

val jar by tasks.getting(Jar::class) {
    archiveBaseName.set("react-native-gradle-plugin")
    from(sourceSets.main.get().output)
}

// We need to patch both the plugin file and its dependency
publishing {
    publications {
        create<MavenPublication>("reactPlugin") {
            artifactId = "react-native-gradle-plugin"
            from(components["java"])
        }
    }
    repositories {
        maven {
            url = uri("${layout.buildDirectory.get()}/repo")
        }
    }
} 