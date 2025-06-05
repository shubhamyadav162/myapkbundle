import org.gradle.api.tasks.bundling.Jar
import org.gradle.api.tasks.testing.Test
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm")
    `java-gradle-plugin`
    `maven-publish`
}

group = "com.facebook.react"
version = "0.0.1-WORKFLOWFIXED" // Custom version marker to confirm our file is used

repositories {
    mavenCentral()
    google()
}

dependencies {
    implementation(gradleApi())
    implementation("com.android.tools.build:gradle:7.3.1") // Android Gradle Plugin version
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
            
            // This is the corrected section for handling allWarningsAsErrors
            val propEnableWarningsAsErrors = project.providers
                .gradleProperty("enableWarningsAsErrors")
                .forUseAtConfigurationTime()
                .map { it.toBoolean() }
                .orElse(false) // Default to false if the property is not found
            
            allWarningsAsErrors.set(propEnableWarningsAsErrors)
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

publishing {
    publications {
        create<MavenPublication>("maven") {
            groupId = project.group.toString()
            artifactId = archiveBaseName.get() 
            version = project.version.toString()
            from(components["java"])
        }
    }
    repositories {
        maven {
            name = "BuildRepo" // Typically for publishing to a local build repository
            url = uri("${layout.buildDirectory.get()}/repo")
        }
    }
} 